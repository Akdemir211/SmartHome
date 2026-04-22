'use client';

import { useEffect, useRef } from 'react';
import { useAssistantStore } from '@/lib/store/assistant-store';

interface CameraPreviewProps {
  videoEl: HTMLVideoElement | null;
}

export function CameraPreview({ videoEl }: CameraPreviewProps) {
  const isCameraOn = useAssistantStore((s) => s.isCameraOn);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !videoEl || !isCameraOn) return;

    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover';
    videoEl.style.borderRadius = '12px';
    videoEl.style.transform = 'scaleX(-1)';
    container.appendChild(videoEl);

    return () => {
      if (container.contains(videoEl)) {
        container.removeChild(videoEl);
      }
    };
  }, [videoEl, isCameraOn]);

  if (!isCameraOn || !videoEl) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-6 z-20 h-28 w-28 overflow-hidden rounded-xl border border-white/10 bg-black/30 shadow-lg backdrop-blur-sm transition-all duration-300"
    />
  );
}
