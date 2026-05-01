'use client';

import { useState } from 'react';

interface PermissionGateProps {
  onGrant: () => Promise<void> | void;
  onDenied?: (message: string) => void;
}

export function PermissionGate({ onGrant, onDenied }: PermissionGateProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      await onGrant();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Mikrofon izni reddedildi.';
      setError(message);
      onDenied?.(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-navy-deep/80 backdrop-blur-md">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] px-10 py-12 text-center shadow-2xl">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-jarvis-purple to-jarvis-cyan shadow-[0_0_40px_rgba(124,58,237,0.6)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8 text-white"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6V9.75a6 6 0 10-12 0v3a6 6 0 006 6zM12 18.75V22.5M8.25 22.5h7.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Alex'e Hoşgeldiniz
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Sesli komutlarınızı algılayabilmem için mikrofon iznine ihtiyacım var.
          Etkinleştirdiğinizde sizi karşılayacağım.
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jarvis-purple to-jarvis-cyan px-8 py-3 text-sm font-medium text-white shadow-lg transition hover:shadow-[0_0_30px_rgba(103,232,249,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'İzin isteniyor…' : 'Mikrofonu etkinleştir'}
        </button>
        {error && (
          <p className="mt-4 text-xs text-rose-300/90">{error}</p>
        )}
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-slate-500">
          Ses verisi cihazınızda analiz edilir • Gemini ile güvenli bağlantı
        </p>
      </div>
    </div>
  );
}
