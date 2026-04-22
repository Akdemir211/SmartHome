'use client';

/**
 * Mikrofondan gelen Float32 PCM örneklerini 16 kHz mono Int16 PCM'e dönüştürür.
 * Gemini Live API bu formatı bekler (audio/pcm;rate=16000).
 */
const TARGET_RATE = 16000;

export function downsampleAndEncode(
  input: Float32Array,
  sourceRate: number,
): Int16Array {
  if (sourceRate === TARGET_RATE) {
    return floatToInt16(input);
  }
  const ratio = sourceRate / TARGET_RATE;
  const outLength = Math.floor(input.length / ratio);
  const output = new Int16Array(outLength);
  let offsetOut = 0;
  let offsetIn = 0;
  while (offsetOut < outLength) {
    const nextOffsetIn = Math.floor((offsetOut + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (
      let i = offsetIn;
      i < nextOffsetIn && i < input.length;
      i += 1
    ) {
      sum += input[i];
      count += 1;
    }
    const sample = count > 0 ? sum / count : 0;
    const clamped = Math.max(-1, Math.min(1, sample));
    output[offsetOut] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    offsetOut += 1;
    offsetIn = nextOffsetIn;
  }
  return output;
}

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    out[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return out;
}

export function int16ToBase64(buffer: Int16Array): string {
  const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)),
    );
  }
  return btoa(binary);
}

export function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}
