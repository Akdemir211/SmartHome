'use client';

import { useEffect, useRef } from 'react';
import type { FrequencyBands } from '@/types';

/**
 * Paylaşılan, mutasyona uğratılan FrequencyBands objesi.
 * R3F içindeki useFrame bu referansı okur; böylece her frame gereksiz allocation olmaz.
 */
export function useFrequencyRef(
  getAnalyser: () => AnalyserNode | null,
): React.MutableRefObject<FrequencyBands> {
  const ref = useRef<FrequencyBands>({ level: 0, low: 0, mid: 0, high: 0 });
  const bufferRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      const analyser = getAnalyser();
      if (analyser) {
        const bins = analyser.frequencyBinCount;
        if (!bufferRef.current || bufferRef.current.length !== bins) {
          bufferRef.current = new Uint8Array(bins);
        }
        analyser.getByteFrequencyData(
          bufferRef.current as Uint8Array<ArrayBuffer>,
        );
        const buf = bufferRef.current;
        const lowEnd = Math.floor(bins * 0.1);
        const midEnd = Math.floor(bins * 0.4);
        let low = 0;
        let mid = 0;
        let high = 0;
        for (let i = 0; i < lowEnd; i += 1) low += buf[i];
        for (let i = lowEnd; i < midEnd; i += 1) mid += buf[i];
        for (let i = midEnd; i < bins; i += 1) high += buf[i];
        const lowAvg = low / lowEnd / 255;
        const midAvg = mid / (midEnd - lowEnd) / 255;
        const highAvg = high / (bins - midEnd) / 255;
        const level = (lowAvg + midAvg + highAvg) / 3;
        ref.current.level = smooth(ref.current.level, level, 0.3);
        ref.current.low = smooth(ref.current.low, lowAvg, 0.3);
        ref.current.mid = smooth(ref.current.mid, midAvg, 0.3);
        ref.current.high = smooth(ref.current.high, highAvg, 0.3);
      } else {
        ref.current.level = smooth(ref.current.level, 0, 0.1);
        ref.current.low = smooth(ref.current.low, 0, 0.1);
        ref.current.mid = smooth(ref.current.mid, 0, 0.1);
        ref.current.high = smooth(ref.current.high, 0, 0.1);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getAnalyser]);

  return ref;
}

function smooth(prev: number, next: number, rate: number): number {
  return prev + (next - prev) * rate;
}
