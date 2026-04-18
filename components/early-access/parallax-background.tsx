'use client';

import { useCallback, useRef, useState } from 'react';

interface ParallaxBackgroundProps {
  imageSrc: string;
  children: React.ReactNode;
}

export function ParallaxBackground({ imageSrc, children }: ParallaxBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const onMove = useCallback((clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (clientX - r.left) / r.width - 0.5;
    const py = (clientY - r.top) / r.height - 0.5;
    setOffset({ x: px * 18, y: py * 14 });
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative min-h-screen w-full overflow-hidden"
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {imgError ? (
        <div
          className="pointer-events-none absolute inset-0 scale-110 bg-[radial-gradient(ellipse_120%_80%_at_50%_100%,#0c1929_0%,#02040a_45%,#000_100%)]"
          aria-hidden
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic marketing background
        <img
          src={imageSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover object-bottom"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.08)`,
            transition: 'transform 0.35s ease-out',
          }}
          onError={() => setImgError(true)}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#02040a]/85 via-[#050a14]/55 to-[#02040a]/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(56,189,248,0.12),transparent_55%)]"
        aria-hidden
      />
      {children}
    </div>
  );
}
