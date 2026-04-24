'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Maximize2, Minimize2, MousePointer2 } from 'lucide-react';
import { useAssistantStore } from '@/lib/store/assistant-store';
import { getVideoElement } from '@/lib/camera/camera-capture';

/* ── Config ── */

const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';

const CONNS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

const MOUSE_SERVER = 'http://localhost:3001';
const PINCH_THRESHOLD = 0.06;
const PINCH_MIN_FRAMES = 2;
const SMOOTH_ALPHA = 0.55;
const MAP_MARGIN = 0.08;
const MOVE_INTERVAL_MS = 20;

/* ── Types ── */

interface Pt { x: number; y: number; z: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Detector = any;

/* ── Singleton model loader ── */

let modelPromise: Promise<Detector> | null = null;

function getDetector(): Promise<Detector> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { FilesetResolver, HandLandmarker } = await import(
        '@mediapipe/tasks-vision'
      );
      const fs = await FilesetResolver.forVisionTasks(WASM_PATH);
      return HandLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 2,
      });
    })();
  }
  return modelPromise;
}

/* ── Drawing ── */

function countFingers(lm: Pt[], hand: string): number {
  let n = 0;
  if (hand === 'Right' ? lm[4].x < lm[3].x : lm[4].x > lm[3].x) n++;
  if (lm[8].y < lm[6].y) n++;
  if (lm[12].y < lm[10].y) n++;
  if (lm[16].y < lm[14].y) n++;
  if (lm[20].y < lm[18].y) n++;
  return n;
}

function drawHands(
  ctx: CanvasRenderingContext2D,
  landmarks: Pt[][],
  handedness: Array<Array<{ categoryName: string }>>,
  w: number, h: number,
) {
  let total = 0;

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const label = handedness[i]?.[0]?.categoryName ?? '';
    total += countFingers(lm, label);

    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const p of lm) {
      const px = (1 - p.x) * w;
      const py = p.y * h;
      bx0 = Math.min(bx0, px); by0 = Math.min(by0, py);
      bx1 = Math.max(bx1, px); by1 = Math.max(by1, py);
    }
    const pad = 20;
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx0 - pad, by0 - pad, bx1 - bx0 + pad * 2, by1 - by0 + pad * 2);

    ctx.fillStyle = '#FF69B4';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(label, bx0 - pad + 4, by0 - pad - 6);

    ctx.strokeStyle = '#FF8C42';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [a, b] of CONNS) {
      ctx.beginPath();
      ctx.moveTo((1 - lm[a].x) * w, lm[a].y * h);
      ctx.lineTo((1 - lm[b].x) * w, lm[b].y * h);
      ctx.stroke();
    }

    for (const p of lm) {
      const px = (1 - p.x) * w;
      const py = p.y * h;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4444';
      ctx.fill();
      ctx.strokeStyle = '#AA0000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (landmarks.length > 0) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px serif';
    ctx.fillText(`Finger count:${total}`, 10, h - 14);
  }
}

/* ── Helpers ── */

function dist2d(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mapRange(
  val: number, inMin: number, inMax: number,
  outMin: number, outMax: number,
): number {
  const mapped = ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  return Math.max(outMin, Math.min(mapped, outMax));
}

function sendMouse(cmd: string) {
  fetch(MOUSE_SERVER, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: cmd,
    keepalive: true,
  }).catch(() => {});
}

/* ── Component ── */

export function HandTracker() {
  const isCameraOn = useAssistantStore((s) => s.isCameraOn);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<Detector>(null);
  const rafRef = useRef(0);
  const overlayRef = useRef(true);
  const gestureModeRef = useRef(false);

  // Virtual screen (all monitors)
  const screenRef = useRef({ x: 0, y: 0, width: 1920, height: 1080 });

  const smoothX = useRef(0);
  const smoothY = useRef(0);
  const posInitialized = useRef(false);
  const lastMoveMs = useRef(0);

  // Pinch state machines
  const leftPinchFrames = useRef(0);
  const leftPinchActive = useRef(false);
  const rightPinchFrames = useRef(0);
  const rightPinchActive = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isOverlayOn, setIsOverlayOn] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [gestureStatus, setGestureStatus] = useState('');

  useEffect(() => { overlayRef.current = isOverlayOn; }, [isOverlayOn]);
  useEffect(() => {
    gestureModeRef.current = isGestureMode;
    if (!isGestureMode) {
      posInitialized.current = false;
      if (leftPinchActive.current) { sendMouse('lu,0,0'); leftPinchActive.current = false; }
      if (rightPinchActive.current) { sendMouse('ru,0,0'); rightPinchActive.current = false; }
    }
  }, [isGestureMode]);

  // Fetch virtual screen bounds (starts lightweight server as side effect)
  useEffect(() => {
    fetch('/api/mouse-control')
      .then((r) => r.json())
      .then((data) => {
        if (data.width) screenRef.current = data;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isCameraOn) return;
    if (detectorRef.current) { setIsLoading(false); return; }

    let cancelled = false;
    getDetector()
      .then((d) => { if (!cancelled) { detectorRef.current = d; setIsLoading(false); } })
      .catch((e) => console.error('[HandTracker] model hatası:', e));

    return () => { cancelled = true; };
  }, [isCameraOn]);

  useEffect(() => {
    if (!isCameraOn || isLoading) return;
    let lastTs = -1;

    function loop() {
      const video = getVideoElement();
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (canvas.width !== vw) canvas.width = vw;
      if (canvas.height !== vh) canvas.height = vh;

      const ctx = canvas.getContext('2d')!;

      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-vw, 0);
      ctx.drawImage(video, 0, 0, vw, vh);
      ctx.restore();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let results: any = null;

      if (detectorRef.current) {
        const ts = performance.now();
        if (ts > lastTs) {
          lastTs = ts;
          try { results = detectorRef.current.detectForVideo(video, ts); } catch { /* skip */ }
        }
      }

      if (overlayRef.current && results?.landmarks?.length) {
        drawHands(ctx, results.landmarks, results.handedness, vw, vh);
      }

      /* ── System cursor control ── */
      if (gestureModeRef.current && results?.landmarks?.length > 0) {
        const lm: Pt[] = results.landmarks[0];
        const thumbTip = lm[4];
        const indexTip = lm[8];
        const middleTip = lm[12];

        const palmX = (lm[0].x + lm[9].x) / 2;
        const palmY = (lm[0].y + lm[9].y) / 2;
        const mirroredX = 1 - palmX;

        const { x: sx, y: sy, width: sw, height: sh } = screenRef.current;
        const rawX = sx + mapRange(mirroredX, MAP_MARGIN, 1 - MAP_MARGIN, 0, sw);
        const rawY = sy + mapRange(palmY, MAP_MARGIN, 1 - MAP_MARGIN, 0, sh);

        if (!posInitialized.current) {
          smoothX.current = rawX;
          smoothY.current = rawY;
          posInitialized.current = true;
        } else {
          smoothX.current += SMOOTH_ALPHA * (rawX - smoothX.current);
          smoothY.current += SMOOTH_ALPHA * (rawY - smoothY.current);
        }

        const cx = Math.round(Math.max(sx, Math.min(smoothX.current, sx + sw)));
        const cy = Math.round(Math.max(sy, Math.min(smoothY.current, sy + sh)));

        // Throttled movement
        const now = Date.now();
        if (now - lastMoveMs.current >= MOVE_INTERVAL_MS) {
          lastMoveMs.current = now;
          sendMouse(`m,${cx},${cy}`);
        }

        // Left pinch (thumb + index) — hold = drag
        const leftDist = dist2d(thumbTip, indexTip);
        const isLeftPinch = leftDist < PINCH_THRESHOLD;

        if (isLeftPinch) {
          leftPinchFrames.current++;
          if (leftPinchFrames.current >= PINCH_MIN_FRAMES && !leftPinchActive.current) {
            leftPinchActive.current = true;
            sendMouse(`ld,${cx},${cy}`);
            setGestureStatus('SOL BASILDI');
          }
        } else {
          if (leftPinchActive.current) {
            leftPinchActive.current = false;
            sendMouse('lu,0,0');
            setGestureStatus('');
          }
          leftPinchFrames.current = 0;
        }

        // Right pinch (thumb + middle) — hold = drag
        const rightDist = dist2d(thumbTip, middleTip);
        const isRightPinch = rightDist < PINCH_THRESHOLD;

        if (isRightPinch) {
          rightPinchFrames.current++;
          if (rightPinchFrames.current >= PINCH_MIN_FRAMES && !rightPinchActive.current) {
            rightPinchActive.current = true;
            sendMouse(`rd,${cx},${cy}`);
            setGestureStatus('SAG BASILDI');
          }
        } else {
          if (rightPinchActive.current) {
            rightPinchActive.current = false;
            sendMouse('ru,0,0');
            setGestureStatus('');
          }
          rightPinchFrames.current = 0;
        }

        // Palm indicator on canvas
        const canvasCx = (1 - palmX) * vw;
        const canvasCy = palmY * vh;
        ctx.beginPath();
        ctx.arc(canvasCx, canvasCy, 12, 0, Math.PI * 2);
        ctx.fillStyle = leftPinchActive.current ? '#22c55e60' : rightPinchActive.current ? '#3b82f660' : '#7c3aed50';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Status text on canvas
        if (leftPinchActive.current) {
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 18px monospace';
          ctx.fillText('SOL BASILI', vw - 160, 30);
        } else if (rightPinchActive.current) {
          ctx.fillStyle = '#3b82f6';
          ctx.font = 'bold 18px monospace';
          ctx.fillText('SAG BASILI', vw - 160, 30);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isCameraOn, isLoading]);

  if (!isCameraOn) return null;

  return (
    <div
      className={`fixed bottom-24 right-6 z-30 flex flex-col overflow-hidden rounded-2xl border border-jarvis-purple/30 bg-black/80 shadow-2xl backdrop-blur-md transition-all duration-300 ${
        isExpanded ? 'h-[520px] w-[640px]' : 'h-80 w-96'
      }`}
    >
      {/* Header */}
      <div className="flex h-9 flex-shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-jarvis-purple">
          El Takibi
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsGestureMode((v) => !v)}
            className={`flex h-6 w-6 items-center justify-center rounded transition ${
              isGestureMode
                ? 'bg-green-500/25 text-green-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={isGestureMode ? 'İmleç kontrolünü kapat' : 'İmleç kontrolünü aç'}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOverlayOn((v) => !v)}
            className={`flex h-6 w-6 items-center justify-center rounded transition ${
              isOverlayOn
                ? 'bg-jarvis-purple/25 text-jarvis-purple'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={isOverlayOn ? 'İzlemeyi kapat' : 'İzlemeyi aç'}
          >
            {isOverlayOn ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-500 transition hover:text-white"
            title={isExpanded ? 'Küçült' : 'Büyüt'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1 bg-black">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-jarvis-purple border-t-transparent" />
            <span className="text-xs text-neutral-400">El takip modeli yükleniyor…</span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="h-full w-full object-contain" />
        )}
      </div>

      {/* Gesture mode status */}
      {isGestureMode && !isLoading && (
        <div className="flex h-7 flex-shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-black/40">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-green-400/80">
            {gestureStatus || 'Sistem İmleci Aktif — Basılı tut = sürükle'}
          </span>
        </div>
      )}
    </div>
  );
}
