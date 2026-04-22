'use client';

let stream: MediaStream | null = null;
let videoEl: HTMLVideoElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

const FRAME_WIDTH = 768;
const FRAME_HEIGHT = 768;
const JPEG_QUALITY = 0.45;
const FPS = 1;

export async function startScreenCapture(
  onFrame: (base64: string) => void,
  onShareEnded?: () => void,
): Promise<void> {
  if (stream) return;

  stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 10, max: 30 },
    },
    audio: false,
  });

  const track = stream.getVideoTracks()[0];
  if (track) {
    track.addEventListener('ended', () => {
      stopScreenCapture();
      onShareEnded?.();
    });
  }

  videoEl = document.createElement('video');
  videoEl.srcObject = stream;
  videoEl.muted = true;
  videoEl.playsInline = true;
  await videoEl.play();

  canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  ctx = canvas.getContext('2d')!;

  intervalId = setInterval(() => {
    if (!videoEl || !ctx || !canvas) return;
    ctx.drawImage(videoEl, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const base64 = dataUrl.split(',')[1];
    if (base64) onFrame(base64);
  }, 1000 / FPS);
}

export function stopScreenCapture(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
    videoEl = null;
  }
  canvas = null;
  ctx = null;
}

export function isScreenCaptureActive(): boolean {
  return !!stream;
}
