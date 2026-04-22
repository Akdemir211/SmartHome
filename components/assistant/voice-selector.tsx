'use client';

import { useAssistantStore } from '@/lib/store/assistant-store';
import { useCallback, useEffect, useRef, useState } from 'react';

const VOICES: { name: string; label: string; desc: string; icon: string }[] = [
  { name: 'Charon', label: 'Charon', desc: 'Sakin ve otoriter', icon: '◆' },
  { name: 'Orus', label: 'Orus', desc: 'Kararlı ve güçlü', icon: '◈' },
  { name: 'Gacrux', label: 'Gacrux', desc: 'Olgun ve derin', icon: '◇' },
  { name: 'Sulafat', label: 'Sulafat', desc: 'Sıcak ve samimi', icon: '○' },
];

async function playVoicePreview(voiceName: string, abortSignal: AbortSignal): Promise<void> {
  const res = await fetch('/api/voice-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceName }),
    signal: abortSignal,
  });

  if (!res.ok) return;

  const arrayBuf = await res.arrayBuffer();
  const contentType = res.headers.get('Content-Type') || '';

  const ctx = new AudioContext({ sampleRate: 24000 });
  try {
    if (contentType.includes('L16') || contentType.includes('pcm')) {
      const int16 = new Int16Array(arrayBuf);
      const buffer = ctx.createBuffer(1, int16.length, 24000);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 0x8000;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start();
      await new Promise<void>((resolve) => { src.onended = () => resolve(); });
    } else {
      const audioBuffer = await ctx.decodeAudioData(arrayBuf);
      const src = ctx.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(ctx.destination);
      src.start();
      await new Promise<void>((resolve) => { src.onended = () => resolve(); });
    }
  } finally {
    await ctx.close();
  }
}

export function VoiceSettingsButton() {
  const isOpen = useAssistantStore((s) => s.isVoiceModalOpen);
  const setOpen = useAssistantStore((s) => s.setVoiceModalOpen);

  return (
    <button
      onClick={() => setOpen(!isOpen)}
      aria-label="Menü"
      className="fixed right-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-jarvis-purple/20 bg-navy-deep/40 backdrop-blur-xl transition-all duration-300 hover:border-jarvis-purple/40 hover:bg-navy-deep/60 active:scale-95"
    >
      <div className="flex flex-col items-center justify-center gap-[5px]">
        <span
          className={`block h-[1.5px] w-4 rounded-full bg-neutral-500 transition-all duration-300 ${
            isOpen ? 'translate-y-[6.5px] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[1.5px] w-4 rounded-full bg-neutral-500 transition-all duration-300 ${
            isOpen ? 'scale-x-0 opacity-0' : ''
          }`}
        />
        <span
          className={`block h-[1.5px] w-4 rounded-full bg-neutral-500 transition-all duration-300 ${
            isOpen ? '-translate-y-[6.5px] -rotate-45' : ''
          }`}
        />
      </div>
    </button>
  );
}

export function VoiceSelectorModal() {
  const isOpen = useAssistantStore((s) => s.isVoiceModalOpen);
  const setOpen = useAssistantStore((s) => s.setVoiceModalOpen);
  const currentVoice = useAssistantStore((s) => s.voiceName);
  const setVoice = useAssistantStore((s) => s.setVoiceName);

  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handlePreview = useCallback(async (name: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPreviewingVoice(name);
    try {
      await playVoicePreview(name, controller.signal);
    } catch {
      // abort veya hata
    } finally {
      if (!controller.signal.aborted) {
        setPreviewingVoice(null);
      }
    }
  }, []);

  const handleSelect = useCallback(
    (name: string) => {
      setVoice(name);
      void handlePreview(name);
    },
    [setVoice, handlePreview],
  );

  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort();
      setPreviewingVoice(null);
      return;
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, setOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen
            ? 'pointer-events-auto bg-black/40 backdrop-blur-[3px]'
            : 'pointer-events-none bg-transparent'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 transition-all duration-300 ease-out ${
          isOpen
            ? '-translate-y-1/2 scale-100 opacity-100'
            : '-translate-y-[45%] scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-jarvis-purple/20 bg-navy-deep/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-jarvis-purple/30 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-jarvis-purple/20 to-jarvis-cyan/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5 text-jarvis-cyan/80">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/80">Ses Modeli</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Voice cards */}
          <div className="space-y-1 px-3 pt-3 pb-4">
            {VOICES.map((v) => {
              const isActive = currentVoice === v.name;
              const isPreviewing = previewingVoice === v.name;

              return (
                <button
                  key={v.name}
                  onClick={() => handleSelect(v.name)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-jarvis-cyan/[0.07] to-jarvis-purple/[0.05] ring-1 ring-inset ring-jarvis-cyan/20'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-jarvis-cyan/15 text-jarvis-cyan'
                        : 'bg-white/[0.04] text-slate-600 group-hover:bg-white/[0.06] group-hover:text-slate-400'
                    }`}
                  >
                    {isPreviewing ? (
                      <div className="flex items-end gap-[2px]">
                        <span className="inline-block h-2 w-[3px] animate-pulse rounded-full bg-jarvis-cyan" />
                        <span className="inline-block h-3 w-[3px] animate-pulse rounded-full bg-jarvis-cyan [animation-delay:150ms]" />
                        <span className="inline-block h-1.5 w-[3px] animate-pulse rounded-full bg-jarvis-cyan [animation-delay:300ms]" />
                      </div>
                    ) : (
                      v.icon
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[20px] font-medium leading-none ${
                          isActive ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {v.label}
                      </span>
                      {isActive && (
                        <span className="rounded bg-jarvis-cyan/10 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-widest text-jarvis-cyan/70">
                          aktif
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-[11px] leading-none ${
                        isActive ? 'text-slate-500' : 'text-slate-600'
                      }`}
                    >
                      {v.desc}
                    </p>
                  </div>

                  {/* Play hint */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      isPreviewing
                        ? 'bg-jarvis-cyan/10 text-jarvis-cyan'
                        : 'text-transparent group-hover:bg-white/[0.04] group-hover:text-slate-600'
                    }`}
                  >
                    {isPreviewing ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-jarvis-cyan/10 to-transparent" />
        </div>
      </div>
    </>
  );
}
