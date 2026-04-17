'use client';

/**
 * Gemini Live kullanılamadığında devreye giren yerel TTS.
 * Mümkünse Türkçe ses seçer, aksi halde varsayılan sesi kullanır.
 */
export function speakTurkish(
  text: string,
  onEnd?: () => void,
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined') return null;
  const synth = window.speechSynthesis;
  if (!synth) return null;

  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 1;
  utterance.pitch = 1;

  const voices = synth.getVoices();
  const trVoice =
    voices.find((v) => v.lang?.toLowerCase().startsWith('tr')) ?? null;
  if (trVoice) utterance.voice = trVoice;

  if (onEnd) utterance.onend = onEnd;
  synth.speak(utterance);
  return utterance;
}

export function cancelSpeech() {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
}
