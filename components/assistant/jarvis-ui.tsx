'use client';

import { useAssistantStore, describeState } from '@/lib/store/assistant-store';
import { useMemo } from 'react';

export function JarvisUI() {
  const state = useAssistantStore((s) => s.state);
  const captions = useAssistantStore((s) => s.captions);

  // En son kullanıcı ve asistan mesajlarını bul
  const { lastUser, lastAssistant } = useMemo(() => {
    let u = '';
    let a = '';
    for (let i = captions.length - 1; i >= 0; i--) {
      const c = captions[i];
      if (!u && c.role === 'user') u = c.text;
      if (!a && c.role === 'assistant') a = c.text;
      if (u && a) break;
    }
    return { lastUser: u, lastAssistant: a };
  }, [captions]);

  const stateText = describeState(state);

  return (
    <div className="pointer-events-none absolute bottom-12 left-12 z-20 flex max-w-2xl flex-col gap-1.5 font-sans text-[15px] leading-relaxed text-slate-400">
      <div className="animate-fade-in text-slate-500">
        Durum: <span className="text-slate-300">{stateText}...</span>
      </div>
      
      {lastUser && (
        <div className="animate-fade-in text-slate-400">
          Kullanıcı: &quot;<span className="text-slate-200">{lastUser}</span>&quot;
        </div>
      )}
      
      {lastAssistant && (
        <div className="animate-fade-in text-slate-400">
          Cevap: &quot;<span className="text-slate-200">{lastAssistant}</span>&quot;
        </div>
      )}
    </div>
  );
}
