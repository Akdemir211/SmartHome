'use client';

import { getAudioContext } from './audio-context';

export interface MicPipeline {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  stop: () => void;
}

let active: MicPipeline | null = null;

export async function startMicPipeline(): Promise<MicPipeline> {
  if (active) return active;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
    },
    video: false,
  });

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;
  source.connect(analyser);

  active = {
    stream,
    source,
    analyser,
    stop: () => {
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {
        // sessizce yut
      }
      stream.getTracks().forEach((track) => track.stop());
      active = null;
    },
  };
  return active;
}

export function getMicPipeline(): MicPipeline | null {
  return active;
}
