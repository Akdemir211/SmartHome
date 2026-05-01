'use client';

import { useAssistantStore } from '@/lib/store/assistant-store';

export function Subtitle() {
  const last = useAssistantStore((s) => s.lastCaption);
  if (!last) return null;
  const isUser = last.role === 'user';
  return (
    <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center px-4">
      <div
        key={last.id}
        className={`max-w-2xl animate-fade-in text-center text-sm leading-relaxed tracking-wide backdrop-blur-sm ${
          isUser ? 'text-slate-400/80' : 'text-jarvis-cyan/90'
        }`}
      >
        <span className="mr-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
          {isUser ? 'Siz' : 'Alex'}
        </span>
        <span>{last.text}</span>
      </div>
    </div>
  );
}
