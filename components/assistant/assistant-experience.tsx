'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAssistantStore } from '@/lib/store/assistant-store';
import { resumeAudioContext } from '@/lib/audio/audio-context';
import { startMicPipeline, getMicPipeline } from '@/lib/audio/mic-analyzer';
import { getOutputPipeline } from '@/lib/audio/output-analyzer';
import { createWakeWordListener } from '@/lib/speech/wake-word';
import {
  createJarvisLiveClient,
  type JarvisLiveClient,
} from '@/lib/gemini/live-client';
import { JarvisUI } from './jarvis-ui';
import { MicToggle } from './mic-toggle';
import { CameraToggle } from './camera-toggle';
import { ScreenToggle } from './screen-toggle';
import { VoiceSettingsButton, VoiceSelectorModal } from './voice-selector';
import { ErrorBanner } from './error-banner';
import { Spotlight } from '@/components/ui/spotlight';
import { SpotlightCursor } from '@/components/ui/spotlight-cursor';
import { FloatingElements } from '@/components/ui/floating-elements';

const JarvisScene = dynamic(
  () => import('@/components/scene/jarvis-scene').then((m) => m.JarvisScene),
  { ssr: false },
);

export function AssistantExperience() {
  const [ready, setReady] = useState(false);
  const state = useAssistantStore((s) => s.state);
  const setState = useAssistantStore((s) => s.setState);
  const setError = useAssistantStore((s) => s.setError);
  const pushCaption = useAssistantStore((s) => s.pushCaption);
  const isMicMuted = useAssistantStore((s) => s.isMicMuted);
  const isCameraOn = useAssistantStore((s) => s.isCameraOn);
  const setCameraOn = useAssistantStore((s) => s.setCameraOn);
  const isScreenShareOn = useAssistantStore((s) => s.isScreenShareOn);
  const setScreenShareOn = useAssistantStore((s) => s.setScreenShareOn);
  const voiceName = useAssistantStore((s) => s.voiceName);

  const voiceNameRef = useRef(voiceName);
  useEffect(() => {
    voiceNameRef.current = voiceName;
  }, [voiceName]);

  const liveClientRef = useRef<JarvisLiveClient | null>(null);
  const wakeListenerRef = useRef<ReturnType<typeof createWakeWordListener> | null>(null);
  const closingRef = useRef(false);
  const connectingRef = useRef(false);
  const retryBlockedUntilRef = useRef(0);
  const bootedRef = useRef(false);

  const analyserSourceRef = useRef<'mic' | 'output'>('mic');
  const getAnalyser = useCallback<() => AnalyserNode | null>(() => {
    if (analyserSourceRef.current === 'output') {
      return getOutputPipeline().analyser;
    }
    return getMicPipeline()?.analyser ?? null;
  }, []);

  const startLiveSession = useCallback(async () => {
    if (liveClientRef.current) return;
    if (connectingRef.current) return;
    if (Date.now() < retryBlockedUntilRef.current) return;
    connectingRef.current = true;
    try {
      setState('connecting');
      wakeListenerRef.current?.stop();
      await resumeAudioContext();

      const client = await createJarvisLiveClient(
        {
          onOpen: () => {
            setState('greeting');
            analyserSourceRef.current = 'output';
          },
          onAudioStart: () => {
            analyserSourceRef.current = 'output';
            setState('speaking');
          },
          onAudioEnd: () => {
            analyserSourceRef.current = 'mic';
            setState('activeSession');
          },
          onUserTranscript: (text, isFinal) => {
            if (isFinal) {
              pushCaption({ role: 'user', text });
              setState('thinking');
            }
          },
          onAssistantTranscript: (text, isFinal) => {
            if (isFinal) {
              pushCaption({ role: 'assistant', text });
            }
          },
          onToolExecuted: (_name, message) => {
            pushCaption({ role: 'system', text: message });
          },
          onError: (message) => {
            if (closingRef.current) return;
            retryBlockedUntilRef.current = Date.now() + 5000;
            setError(message);
            void teardownLiveSession();
          },
          onClose: () => {
            if (closingRef.current) return;
            liveClientRef.current = null;
            analyserSourceRef.current = 'mic';
            setState('idleWakeListening');
            wakeListenerRef.current?.start();
          },
          onScreenShareEnded: () => {
            setScreenShareOn(false);
          },
        },
        voiceNameRef.current,
      );
      liveClientRef.current = client;
      connectingRef.current = false;
      if (!isMicMuted) {
        await client.startMicStreaming();
      }
    } catch (err) {
      connectingRef.current = false;
      const message =
        err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setError(message);
      liveClientRef.current = null;
      retryBlockedUntilRef.current = Date.now() + 5000;
    }
  }, [pushCaption, setError, setState, isMicMuted]);

  const teardownLiveSession = useCallback(async () => {
    if (!liveClientRef.current) return;
    closingRef.current = true;
    try {
      await liveClientRef.current.close();
    } finally {
      liveClientRef.current = null;
      analyserSourceRef.current = 'mic';
      closingRef.current = false;
    }
  }, []);

  // Ses değiştiğinde oturumu yeniden başlat
  const prevVoiceRef = useRef(voiceName);
  useEffect(() => {
    if (prevVoiceRef.current === voiceName) return;
    prevVoiceRef.current = voiceName;
    if (!liveClientRef.current && !connectingRef.current) return;
    void teardownLiveSession().then(() => {
      void startLiveSession();
    });
  }, [voiceName, teardownLiveSession, startLiveSession]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    async function boot() {
      try {
        setState('permissionPending');
        await resumeAudioContext();
        await startMicPipeline();
        setReady(true);

        const wake = createWakeWordListener(
          () => { void startLiveSession(); },
          (msg) => console.warn('[wake]', msg),
        );
        wakeListenerRef.current = wake;
        void startLiveSession();
      } catch {
        setState('permissionDenied');
        setError(
          'Mikrofon izni alınamadı. Tarayıcı ayarlarından izin verin ve sayfayı yenileyin.',
        );
        setReady(true);
      }
    }

    void boot();
  }, [setState, setError, startLiveSession]);

  const handleCanvasTap = useCallback(() => {
    if (liveClientRef.current || connectingRef.current) return;
    void startLiveSession();
  }, [startLiveSession]);

  useEffect(() => {
    return () => {
      wakeListenerRef.current?.stop();
      wakeListenerRef.current = null;
      closingRef.current = true;
      liveClientRef.current?.close().catch(() => {});
      liveClientRef.current = null;
    };
  }, []);

  useEffect(() => {
    const client = liveClientRef.current;
    if (!client) return;
    if (isMicMuted) {
      client.stopMicStreaming();
    } else {
      void client.startMicStreaming();
    }
  }, [isMicMuted]);

  useEffect(() => {
    const client = liveClientRef.current;
    if (!client) return;
    if (isCameraOn) {
      void client.startCameraStreaming();
    } else {
      client.stopCameraStreaming();
      setCameraOn(false);
    }
  }, [isCameraOn, setCameraOn]);

  useEffect(() => {
    const client = liveClientRef.current;
    if (!client) return;
    if (isScreenShareOn) {
      void client.startScreenStreaming();
    } else {
      client.stopScreenStreaming();
    }
  }, [isScreenShareOn]);

  return (
    <>
      <FloatingElements />
      <SpotlightCursor config={{ radius: 300, brightness: 0.35, color: '#7c3aed' }} />
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#7c3aed"
      />

      <div
        role="presentation"
        onClick={handleCanvasTap}
        className="absolute inset-0"
      >
        <JarvisScene getAnalyser={getAnalyser} />
      </div>

      {ready && (
        <>
          <JarvisUI />
          <VoiceSettingsButton />
          <VoiceSelectorModal />
          <ScreenToggle />
          <CameraToggle />
          <MicToggle />
          <ErrorBanner onRetry={() => void startLiveSession()} />
        </>
      )}

      <header className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-jarvis-purple/70" />
        <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          Jarvis · Smart Home
        </span>
      </header>

      <div className="sr-only" aria-live="polite" role="status">
        {state}
      </div>
    </>
  );
}
