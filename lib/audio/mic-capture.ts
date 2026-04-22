'use client';

import { getAudioContext } from './audio-context';
import { getMicPipeline } from './mic-analyzer';
import { downsampleAndEncode } from './pcm-encoder';

export interface PcmCapture {
  stop: () => void;
}

let workletReady = false;

async function ensureWorklet(ctx: AudioContext): Promise<void> {
  if (workletReady) return;
  try {
    await ctx.audioWorklet.addModule('/pcm-worklet.js');
    workletReady = true;
  } catch {
    workletReady = false;
    throw new Error('AudioWorklet modülü yüklenemedi.');
  }
}

export async function startPcmCapture(
  onPcm: (chunk: Int16Array) => void,
): Promise<PcmCapture> {
  const pipeline = getMicPipeline();
  if (!pipeline) {
    throw new Error('Mikrofon pipeline başlatılmamış.');
  }
  const ctx = getAudioContext();

  await ensureWorklet(ctx);

  const workletNode = new AudioWorkletNode(ctx, 'pcm-capture', {
    channelCount: 1,
    numberOfInputs: 1,
    numberOfOutputs: 0,
  });

  workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    const input = event.data;
    if (!input || input.length === 0) return;
    const copy = new Float32Array(input.length);
    copy.set(input);
    const encoded = downsampleAndEncode(copy, ctx.sampleRate);
    onPcm(encoded);
  };

  pipeline.source.connect(workletNode);

  return {
    stop: () => {
      try {
        pipeline.source.disconnect(workletNode);
        workletNode.disconnect();
        workletNode.port.close();
      } catch {
        // sessizce yut
      }
    },
  };
}
