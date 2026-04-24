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

export type DeviceKind = 'light' | 'ac' | 'tv' | 'curtain' | 'plug' | 'bulb';

export type BulbMode = 'white' | 'colour';

export interface Device {
  id: string;
  kind: DeviceKind;
  label: string;
  on: boolean;
  temperature?: number;
  tuyaDeviceId?: string;
  brightness?: number;
  color?: string;
  colorTemp?: number;
  bulbMode?: BulbMode;
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
