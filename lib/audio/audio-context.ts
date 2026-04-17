'use client';

/**
 * Tek bir paylaşılan AudioContext. Gemini Live çıkışı 24 kHz PCM olarak geldiği için
 * varsayılan sample rate'i 24 kHz olarak talep ediyoruz.
 */
let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext yalnızca tarayıcıda kullanılabilir.');
  }
  if (!sharedContext || sharedContext.state === 'closed') {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    sharedContext = new Ctor({ sampleRate: 24000, latencyHint: 'interactive' });
  }
  return sharedContext;
}

export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
