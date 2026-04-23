export type AssistantState =
  | 'boot'
  | 'permissionPending'
  | 'permissionDenied'
  | 'connecting'
  | 'greeting'
  | 'idleWakeListening'
  | 'activeSession'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface FrequencyBands {
  level: number;
  low: number;
  mid: number;
  high: number;
}

export type DeviceKind = 'light' | 'ac' | 'tv' | 'curtain' | 'plug';

export interface Device {
  id: string;
  kind: DeviceKind;
  label: string;
  on: boolean;
  temperature?: number;
  tuyaDeviceId?: string;
}

export interface Room {
  id: string;
  label: string;
  devices: Device[];
}

export interface CaptionEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: number;
}
