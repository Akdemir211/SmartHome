'use client';

import { describeState, useAssistantStore } from '@/lib/store/assistant-store';

export function StatusCaption() {
  const state = useAssistantStore((s) => s.state);
  const error = useAssistantStore((s) => s.errorMessage);

  const label = error ?? describeState(state);
  const pulsing = state === 'activeSession' || state === 'speaking' || state === 'thinking';

  return (
    <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 backdrop-blur-md transition ${
          pulsing ? 'shadow-[0_0_20px_rgba(124,58,237,0.35)]' : ''
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            error
              ? 'bg-rose-400'
              : state === 'idleWakeListening'
                ? 'bg-jarvis-cyan/80'
                : state === 'speaking'
                  ? 'bg-jarvis-violet animate-pulse'
                  : state === 'activeSession'
                    ? 'bg-jarvis-cyan animate-pulse'
                    : state === 'thinking'
                      ? 'bg-jarvis-glow animate-pulse'
                      : 'bg-slate-400'
          }`}
        />
        <span>{label}</span>
      </div>
    </div>
  );
}
