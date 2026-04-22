'use client';

import { useAssistantStore } from '@/lib/store/assistant-store';

export function ScreenToggle() {
  const isScreenShareOn = useAssistantStore((s) => s.isScreenShareOn);
  const toggleScreenShare = useAssistantStore((s) => s.toggleScreenShare);
  const setCameraOn = useAssistantStore((s) => s.setCameraOn);

  function handleClick() {
    if (!isScreenShareOn) setCameraOn(false);
    toggleScreenShare();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isScreenShareOn ? 'Ekran paylaşımını durdur' : 'Ekranı paylaş'}
      className="fixed bottom-6 right-[8.75rem] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-jarvis-purple/20 bg-navy-deep/40 backdrop-blur-md transition-all duration-200 hover:border-jarvis-purple/40 hover:bg-navy-deep/60 active:scale-95"
    >
      {isScreenShareOn ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-jarvis-purple"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
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
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="2" y1="7" x2="22" y2="7" />
          <path d="M7 21h10" />
          <path d="M12 17v4" />
        </svg>
      )}
    </button>
  );
}
