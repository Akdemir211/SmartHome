'use client';

import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionLike,
} from './web-speech-types';

export interface WakeWordListener {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

// "hey alex" varyasyonları: Türkçe STT bunu bazen "hey aleks", "ey alex" gibi
// algılayabiliyor; toleranslı eşleştiriyoruz.
const WAKE_PATTERNS = [
  /\bhey\s*al[ée]?x\b/i,
  /\bey\s*al[ée]?x\b/i,
  /\bhe?y?\s*alex\b/i,
  /\balex\b/i,
];

function matchesWakeWord(text: string): boolean {
  const normalized = text.toLocaleLowerCase('tr-TR');
  return WAKE_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function createWakeWordListener(
  onDetected: () => void,
  onError?: (message: string) => void,
): WakeWordListener {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    return {
      isSupported: false,
      start: () => {
        onError?.('Tarayıcı wake word tanımayı desteklemiyor.');
      },
      stop: () => {},
    };
  }

  const Ctor2 = Ctor;
  let recognition: SpeechRecognitionLike | null = null;
  let wantActive = false;

  function build(): SpeechRecognitionLike {
    const rec = new Ctor2();
    rec.lang = 'tr-TR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j += 1) {
          const alt = (result as unknown as Record<number, { transcript: string }>)[j];
          if (!alt) continue;
          if (matchesWakeWord(alt.transcript)) {
            onDetected();
            return;
          }
        }
      }
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        onError?.('Mikrofon izni reddedildi.');
        wantActive = false;
        return;
      }
      // diğer hatalar: sessizce devam, onend restart'ı yapacak
    };

    rec.onend = () => {
      if (wantActive) {
        // tarayıcı otomatik olarak durdurabilir; geri başlat
        setTimeout(() => {
          if (wantActive) {
            try {
              rec.start();
            } catch {
              // zaten çalışıyor
            }
          }
        }, 300);
      }
    };

    return rec;
  }

  return {
    isSupported: true,
    start: () => {
      wantActive = true;
      if (!recognition) recognition = build();
      try {
        recognition.start();
      } catch {
        // zaten çalışıyor olabilir
      }
    },
    stop: () => {
      wantActive = false;
      try {
        recognition?.abort();
      } catch {
        // sessizce yut
      }
    },
  };
}
