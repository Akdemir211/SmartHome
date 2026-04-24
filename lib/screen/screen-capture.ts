'use client';

let stream: MediaStream | null = null;
let videoEl: HTMLVideoElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

const JPEG_QUALITY = 0.65;
const FPS = 2;

const RULER_SIZE = 28;
const TICK_INTERVAL = 200;
const RULER_BG = 'rgba(0,0,0,0.55)';
const RULER_FG = '#0f0';
const FONT = 'bold 11px monospace';

let capturedWidth = 0;
let capturedHeight = 0;
let realScreenWidth = 1920;
let realScreenHeight = 1080;

export function getScreenCaptureSize() {
  return { width: capturedWidth, height: capturedHeight };
}

export function setRealScreenSize(w: number, h: number) {
  realScreenWidth = w;
  realScreenHeight = h;
}

function drawRulers(c: CanvasRenderingContext2D, cw: number, ch: number) {
  const scaleX = realScreenWidth / cw;
  const scaleY = realScreenHeight / ch;

  c.save();

  c.fillStyle = RULER_BG;
  c.fillRect(0, 0, cw, RULER_SIZE);
  c.fillRect(0, 0, RULER_SIZE, ch);

  c.font = FONT;
  c.fillStyle = RULER_FG;
  c.strokeStyle = RULER_FG;
  c.lineWidth = 1;
  c.textBaseline = 'top';
  c.textAlign = 'center';

  for (let px = 0; px <= realScreenWidth; px += TICK_INTERVAL) {
    const cx = Math.round(px / scaleX);
    c.beginPath();
    c.moveTo(cx, 0);
    c.lineTo(cx, RULER_SIZE);
    c.stroke();
    if (px > 0) c.fillText(String(px), cx, 3);
  }

  c.textAlign = 'left';
  c.textBaseline = 'middle';
  for (let py = 0; py <= realScreenHeight; py += TICK_INTERVAL) {
    const cy = Math.round(py / scaleY);
    c.beginPath();
    c.moveTo(0, cy);
    c.lineTo(RULER_SIZE, cy);
    c.stroke();
    if (py > 0) c.fillText(String(py), 3, cy);
  }

  c.restore();
}

export async function startScreenCapture(
  onFrame: (base64: string) => void,
  onShareEnded?: () => void,
): Promise<void> {
  if (stream) return;

  stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
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
  ctx = canvas.getContext('2d')!;

  let canvasSized = false;

  intervalId = setInterval(() => {
    if (!videoEl || !ctx || !canvas) return;

    if (!canvasSized && videoEl.videoWidth > 0) {
      const vw = videoEl.videoWidth;
      const vh = videoEl.videoHeight;
      canvas.width = vw;
      canvas.height = vh;
      capturedWidth = vw;
      capturedHeight = vh;
      canvasSized = true;
    }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    drawRulers(ctx, canvas.width, canvas.height);

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
  capturedWidth = 0;
  capturedHeight = 0;
}

export function isScreenCaptureActive(): boolean {
  return !!stream;
}
