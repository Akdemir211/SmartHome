'use client';

import { useAssistantStore } from '@/lib/store/assistant-store';

interface ErrorBannerProps {
  onRetry?: () => void;
}

export function ErrorBanner({ onRetry }: ErrorBannerProps) {
  const error = useAssistantStore((s) => s.errorMessage);
  const setError = useAssistantStore((s) => s.setError);
  if (!error) return null;

  return (
    <div className="pointer-events-auto absolute bottom-24 left-1/2 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-rose-400/30 bg-rose-950/40 px-5 py-3 shadow-xl backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-rose-400" />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">
            Bağlantı Hatası
          </p>
          <p className="mt-1 text-sm text-rose-100/90">{error}</p>
        </div>
        <div className="flex flex-col gap-1">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border border-rose-300/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose-100 transition hover:bg-rose-400/20"
            >
              Tekrar dene
            </button>
          )}
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose-200/80 transition hover:text-rose-100"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
