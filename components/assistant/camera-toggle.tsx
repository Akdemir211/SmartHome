'use client';

import { useAssistantStore } from '@/lib/store/assistant-store';

export function CameraToggle() {
  const isCameraOn = useAssistantStore((s) => s.isCameraOn);
  const toggleCamera = useAssistantStore((s) => s.toggleCamera);

  return (
    <button
      onClick={toggleCamera}
      aria-label={isCameraOn ? 'Kamerayı kapat' : 'Kamerayı aç'}
      className="fixed bottom-6 right-20 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-200 hover:bg-white/10 active:scale-95"
    >
      {isCameraOn ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-jarvis-cyan"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-slate-500"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
        </svg>
      )}
    </button>
  );
}
