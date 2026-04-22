'use client';

import {
  GoogleGenAI,
  Modality,
  type LiveServerMessage,
  type Session,
} from '@google/genai';
import { JARVIS_SYSTEM_PROMPT } from './system-prompt';
import { smartHomeTools, executeSmartHomeTool } from '@/lib/smart-home/tools';
import { pcControlTools } from '@/lib/pc-control/pc-tools';
import { base64ToInt16, int16ToBase64 } from '@/lib/audio/pcm-encoder';
import { getOutputPipeline } from '@/lib/audio/output-analyzer';
import { startPcmCapture, type PcmCapture } from '@/lib/audio/mic-capture';
import {
  startCameraCapture,
  stopCameraCapture,
} from '@/lib/camera/camera-capture';
import {
  startScreenCapture,
  stopScreenCapture,
} from '@/lib/screen/screen-capture';

const PC_TOOL_NAMES = new Set([
  'open_application',
  'close_application',
  'open_url',
  'play_youtube',
  'run_command',
  'run_powershell',
  'set_volume',
  'mute_volume',
  'lock_computer',
  'shutdown_computer',
  'restart_computer',
  'sleep_computer',
  'cancel_shutdown',
  'search_files',
  'open_file',
  'create_folder',
]);

async function executePcToolViaApi(
  tool: string,
  args: Record<string, unknown>,
): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const res = await fetch('/api/pc-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args }),
    });
    if (!res.ok) {
      return { ok: false, message: `PC kontrol isteği başarısız: HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `PC kontrol hatası: ${msg}` };
  }
}

export interface LiveClientCallbacks {
  onOpen?: () => void;
  onUserTranscript?: (text: string, isFinal: boolean) => void;
  onAssistantTranscript?: (text: string, isFinal: boolean) => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onToolExecuted?: (name: string, message: string) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
  onScreenShareEnded?: () => void;
}

interface TokenPayload {
  token: string;
  model: string;
}

async function fetchEphemeralToken(): Promise<TokenPayload> {
  const res = await fetch('/api/gemini-live', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'HTTP ' + res.status }));
    throw new Error(err.error ?? 'Token alınamadı');
  }
  return (await res.json()) as TokenPayload;
}

export class JarvisLiveClient {
  private session: Session | null = null;
  private capture: PcmCapture | null = null;
  private cameraActive = false;
  private screenShareActive = false;
  private callbacks: LiveClientCallbacks;
  private pendingUser = '';
  private pendingAssistant = '';
  private closed = false;
  private outputSubs: (() => void)[] = [];
  private connected = false;

  private voiceName: string;

  constructor(callbacks: LiveClientCallbacks, voiceName = 'Charon') {
    this.callbacks = callbacks;
    this.voiceName = voiceName;
  }

  async connect(): Promise<void> {
    const { token, model } = await fetchEphemeralToken();

    if (!token || token.length < 10) {
      throw new Error(
        'Geçerli bir Gemini API anahtarı bulunamadı. .env.local dosyasını kontrol edin.',
      );
    }

    const ai = new GoogleGenAI({ apiKey: token });

    const output = getOutputPipeline();
    this.outputSubs.push(
      output.onStart(() => this.callbacks.onAudioStart?.()),
      output.onEnd(() => this.callbacks.onAudioEnd?.()),
    );

    try {
      this.session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.voiceName },
            },
          },
          systemInstruction: JARVIS_SYSTEM_PROMPT,
          tools: [{ functionDeclarations: [...smartHomeTools, ...pcControlTools] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            this.connected = true;
            this.callbacks.onOpen?.();
          },
          onmessage: (msg: LiveServerMessage) => {
            this.handleMessage(msg).catch((e) => {
              console.error('[JarvisLive] mesaj işleme hatası', e);
            });
          },
          onerror: (err: ErrorEvent) => {
            this.connected = false;
            const msg = err.message || 'Gemini Live bağlantı hatası';
            console.error('[JarvisLive] hata:', msg);
            this.callbacks.onError?.(msg);
          },
          onclose: (e: CloseEvent) => {
            this.connected = false;
            this.stopMicStreaming();
            if (!this.closed) {
              const reason =
                e.reason ||
                (e.code === 1006
                  ? 'Bağlantı kurulamadı. API anahtarınızın doğru bir Gemini anahtarı olduğundan emin olun.'
                  : 'Bağlantı kapandı (kod: ' + e.code + ')');
              this.callbacks.onError?.(reason);
            }
            this.callbacks.onClose?.();
          },
        },
      });
    } catch (err) {
      this.connected = false;
      const msg =
        err instanceof Error
          ? err.message
          : 'Gemini Live bağlantısı kurulamadı';
      throw new Error(msg);
    }
  }

  private isSessionOpen(): boolean {
    return !!this.session && this.connected && !this.closed;
  }

  async startMicStreaming(): Promise<void> {
    if (!this.isSessionOpen()) return;
    if (this.capture) return;
    this.capture = await startPcmCapture((chunk) => {
      if (!this.isSessionOpen()) return;
      const data = int16ToBase64(chunk);
      try {
        this.session!.sendRealtimeInput({
          audio: {
            data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } catch {
        // WebSocket kapanmışsa sessizce dur, mikrofon capture'ı durdur
        this.stopMicStreaming();
      }
    });
  }

  stopMicStreaming(): void {
    this.capture?.stop();
    this.capture = null;
  }

  async startCameraStreaming(): Promise<HTMLVideoElement | null> {
    if (!this.isSessionOpen()) return null;
    if (this.cameraActive) return null;
    this.stopScreenStreaming();
    this.cameraActive = true;
    try {
      const videoEl = await startCameraCapture((base64) => {
        if (!this.isSessionOpen()) return;
        try {
          this.session!.sendRealtimeInput({
            video: {
              data: base64,
              mimeType: 'image/jpeg',
            },
          });
        } catch {
          // WebSocket kapanmışsa sessizce dur
        }
      });
      return videoEl;
    } catch {
      this.cameraActive = false;
      return null;
    }
  }

  stopCameraStreaming(): void {
    this.cameraActive = false;
    stopCameraCapture();
  }

  async startScreenStreaming(): Promise<void> {
    if (!this.isSessionOpen()) return;
    if (this.screenShareActive) return;
    this.stopCameraStreaming();
    this.screenShareActive = true;
    try {
      await startScreenCapture(
        (base64) => {
          if (!this.isSessionOpen()) return;
          try {
            this.session!.sendRealtimeInput({
              video: {
                data: base64,
                mimeType: 'image/jpeg',
              },
            });
          } catch {
            /* WebSocket kapandı */
          }
        },
        () => {
          this.screenShareActive = false;
          stopScreenCapture();
          this.callbacks.onScreenShareEnded?.();
        },
      );
    } catch {
      this.screenShareActive = false;
      stopScreenCapture();
      this.callbacks.onScreenShareEnded?.();
    }
  }

  stopScreenStreaming(): void {
    this.screenShareActive = false;
    stopScreenCapture();
  }

  sendText(text: string): void {
    if (!this.isSessionOpen()) return;
    try {
      this.session!.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      });
    } catch {
      // sessizce yut
    }
  }

  async close(): Promise<void> {
    this.closed = true;
    this.connected = false;
    this.stopMicStreaming();
    this.stopCameraStreaming();
    this.stopScreenStreaming();
    this.outputSubs.forEach((unsub) => unsub());
    this.outputSubs = [];
    try {
      this.session?.close();
    } catch {
      // sessizce yut
    }
    this.session = null;
  }

  private async handleMessage(msg: LiveServerMessage): Promise<void> {
    const server = msg.serverContent;

    if (server?.inputTranscription?.text) {
      this.pendingUser += server.inputTranscription.text;
      this.callbacks.onUserTranscript?.(this.pendingUser, false);
    }
    if (server?.outputTranscription?.text) {
      this.pendingAssistant += server.outputTranscription.text;
      this.callbacks.onAssistantTranscript?.(this.pendingAssistant, false);
    }

    const modelTurn = server?.modelTurn;
    if (modelTurn?.parts) {
      for (const part of modelTurn.parts) {
        const inline = part.inlineData;
        if (inline?.mimeType?.startsWith('audio/pcm') && inline.data) {
          const pcm = base64ToInt16(inline.data);
          const pipeline = getOutputPipeline();
          pipeline.schedule(pcm);
        }
      }
    }

    if (server?.turnComplete) {
      if (this.pendingUser.trim().length > 0) {
        this.callbacks.onUserTranscript?.(this.pendingUser.trim(), true);
      }
      if (this.pendingAssistant.trim().length > 0) {
        this.callbacks.onAssistantTranscript?.(
          this.pendingAssistant.trim(),
          true,
        );
      }
      this.pendingUser = '';
      this.pendingAssistant = '';
    }

    if (server?.interrupted) {
      getOutputPipeline().stop();
    }

    const toolCall = msg.toolCall;
    if (
      toolCall?.functionCalls &&
      toolCall.functionCalls.length > 0 &&
      this.isSessionOpen()
    ) {
      const responses = await Promise.all(
        toolCall.functionCalls.map(async (fc) => {
          const name = fc.name ?? '';
          const args = (fc.args as Record<string, unknown>) ?? {};

          let result: { ok: boolean; message: string; data?: unknown };

          if (PC_TOOL_NAMES.has(name)) {
            result = await executePcToolViaApi(name, args);
          } else {
            result = executeSmartHomeTool(name, args);
          }

          if (name) {
            this.callbacks.onToolExecuted?.(name, result.message);
          }
          return {
            id: fc.id,
            name,
            response: result as unknown as Record<string, unknown>,
          };
        }),
      );
      try {
        this.session!.sendToolResponse({ functionResponses: responses });
      } catch {
        // WebSocket kapandıysa sessizce geç
      }
    }
  }
}

export async function createJarvisLiveClient(
  callbacks: LiveClientCallbacks,
  voiceName = 'Charon',
): Promise<JarvisLiveClient> {
  const client = new JarvisLiveClient(callbacks, voiceName);
  await client.connect();
  return client;
}
