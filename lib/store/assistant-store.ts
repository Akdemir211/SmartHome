'use client';

import { create } from 'zustand';
import type { AssistantState, CaptionEntry } from '@/types';

interface AssistantStore {
  state: AssistantState;
  errorMessage: string | null;
  lastCaption: CaptionEntry | null;
  captions: CaptionEntry[];
  isMicMuted: boolean;
  isCameraOn: boolean;
  isScreenShareOn: boolean;
  voiceName: string;
  isVoiceModalOpen: boolean;
  setState: (state: AssistantState) => void;
  setError: (message: string | null) => void;
  pushCaption: (entry: Omit<CaptionEntry, 'id' | 'createdAt'>) => void;
  clearCaptions: () => void;
  setMicMuted: (muted: boolean) => void;
  toggleMic: () => void;
  setCameraOn: (on: boolean) => void;
  toggleCamera: () => void;
  setScreenShareOn: (on: boolean) => void;
  toggleScreenShare: () => void;
  setVoiceName: (name: string) => void;
  setVoiceModalOpen: (open: boolean) => void;
}

export const useAssistantStore = create<AssistantStore>((set) => ({
  state: 'boot',
  errorMessage: null,
  lastCaption: null,
  captions: [],
  isMicMuted: false,
  isCameraOn: false,
  isScreenShareOn: false,
  voiceName: 'Charon',
  isVoiceModalOpen: false,
  setState: (state) =>
    set((prev) => ({
      state,
      errorMessage: state === 'error' ? prev.errorMessage : null,
    })),
  setError: (message) =>
    set(() => ({
      errorMessage: message,
      state: message ? 'error' : 'idleWakeListening',
    })),
  pushCaption: (entry) =>
    set((prev) => {
      const next: CaptionEntry = {
        ...entry,
        id: `${entry.role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      return {
        lastCaption: next,
        captions: [...prev.captions.slice(-19), next],
      };
    }),
  clearCaptions: () => set(() => ({ captions: [], lastCaption: null })),
  setMicMuted: (muted) => set(() => ({ isMicMuted: muted })),
  toggleMic: () => set((prev) => ({ isMicMuted: !prev.isMicMuted })),
  setCameraOn: (on) => set(() => ({ isCameraOn: on })),
  toggleCamera: () => set((prev) => ({ isCameraOn: !prev.isCameraOn })),
  setScreenShareOn: (on) => set(() => ({ isScreenShareOn: on })),
  toggleScreenShare: () => set((prev) => ({ isScreenShareOn: !prev.isScreenShareOn })),
  setVoiceName: (name) => set(() => ({ voiceName: name })),
  setVoiceModalOpen: (open) => set(() => ({ isVoiceModalOpen: open })),
}));

export function describeState(state: AssistantState): string {
  switch (state) {
    case 'boot':
      return 'Başlatılıyor';
    case 'permissionPending':
      return 'Mikrofon izni bekleniyor';
    case 'permissionDenied':
      return 'Mikrofon izni reddedildi';
    case 'connecting':
      return 'Bağlanılıyor';
    case 'greeting':
      return 'Karşılıyor';
    case 'idleWakeListening':
      return '"Hey Jarvis" deyin';
    case 'activeSession':
      return 'Yapay Zeka Dinliyor';
    case 'thinking':
      return 'Yapay Zeka Düşünüyor';
    case 'speaking':
      return 'Yapay Zeka Konuşuyor';
    case 'error':
      return 'Hata';
    default:
      return '';
  }
}
