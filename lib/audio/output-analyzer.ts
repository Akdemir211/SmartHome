'use client';

import { getAudioContext } from './audio-context';

/**
 * AI ses çıkışı için analiz+oynatma zinciri.
 * Gemini Live 24 kHz PCM16 gönderiyor; biz Float32'ye çevirip AudioBufferSourceNode
 * ile ardışık olarak oynatıyoruz. Aynı zincir analyser'a da bağlı, böylece 3D küre
 * AI'ın konuşma frekansına tepki veriyor.
 */
interface OutputPipeline {
  analyser: AnalyserNode;
  gain: GainNode;
  sampleRate: number;
  schedule: (pcm: Int16Array) => void;
  onStart: (cb: () => void) => () => void;
  onEnd: (cb: () => void) => () => void;
  stop: () => void;
  isPlaying: () => boolean;
}

let pipeline: OutputPipeline | null = null;

const OUTPUT_SAMPLE_RATE = 24000;

export function getOutputPipeline(): OutputPipeline {
  if (pipeline) return pipeline;

  const ctx = getAudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;

  const gain = ctx.createGain();
  gain.gain.value = 1;
  gain.connect(analyser);
  analyser.connect(ctx.destination);

  let nextStart = 0;
  let activeSources = 0;
  const activeSrcNodes = new Set<AudioBufferSourceNode>();
  const startSubs = new Set<() => void>();
  const endSubs = new Set<() => void>();

  function schedule(pcm: Int16Array) {
    if (pcm.length === 0) return;
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const buffer = audioCtx.createBuffer(
      1,
      pcm.length,
      OUTPUT_SAMPLE_RATE,
    );
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) {
      channel[i] = pcm[i] / 0x8000;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);

    const now = audioCtx.currentTime;
    if (nextStart < now + 0.02) {
      nextStart = now + 0.02;
    }

    if (activeSources === 0) {
      startSubs.forEach((cb) => cb());
    }
    activeSources += 1;
    activeSrcNodes.add(src);
    src.start(nextStart);
    nextStart += buffer.duration;

    src.onended = () => {
      activeSrcNodes.delete(src);
      activeSources -= 1;
      if (activeSources <= 0) {
        activeSources = 0;
        endSubs.forEach((cb) => cb());
      }
    };
  }

  function stopAll() {
    activeSrcNodes.forEach((src) => {
      try { src.stop(); } catch { /* zaten durmuş */ }
      try { src.disconnect(); } catch { /* */ }
    });
    activeSrcNodes.clear();
    nextStart = 0;
    activeSources = 0;
    endSubs.forEach((cb) => cb());
  }

  pipeline = {
    analyser,
    gain,
    sampleRate: OUTPUT_SAMPLE_RATE,
    schedule,
    onStart: (cb) => {
      startSubs.add(cb);
      return () => startSubs.delete(cb);
    },
    onEnd: (cb) => {
      endSubs.add(cb);
      return () => endSubs.delete(cb);
    },
    stop: stopAll,
    isPlaying: () => activeSources > 0,
  };

  return pipeline;
}
