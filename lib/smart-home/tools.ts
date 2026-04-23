import { Type, type FunctionDeclaration } from '@google/genai';
import type { DeviceKind } from '@/types';
import { useDevicesStore } from './devices-store';
import { DEVICE_KIND_LABEL } from './device-registry';

export const ROOM_IDS = ['living-room', 'bedroom', 'kitchen'] as const;
export const DEVICE_KINDS: DeviceKind[] = ['light', 'ac', 'tv', 'curtain', 'plug'];

export const smartHomeTools: FunctionDeclaration[] = [
  {
    name: 'set_device_power',
    description:
      "Belirtilen odadaki belirtilen türden cihazı açar veya kapatır. Örnek: oturma odasındaki ışığı kapat.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        room: {
          type: Type.STRING,
          description: 'Odanın kimliği.',
          enum: [...ROOM_IDS],
        },
        device: {
          type: Type.STRING,
          description: 'Cihazın türü.',
          enum: DEVICE_KINDS,
        },
        on: {
          type: Type.BOOLEAN,
          description: 'true açar, false kapatır.',
        },
      },
      required: ['room', 'device', 'on'],
    },
  },
  {
    name: 'set_ac_temperature',
    description: "Belirtilen odadaki klimanın sıcaklığını ayarlar (16-30 °C).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        room: {
          type: Type.STRING,
          description: 'Odanın kimliği.',
          enum: [...ROOM_IDS],
        },
        temperature: {
          type: Type.NUMBER,
          description: 'Santigrat cinsinden hedef sıcaklık.',
        },
      },
      required: ['room', 'temperature'],
    },
  },
  {
    name: 'get_home_status',
    description:
      'Evdeki tüm odaları ve cihaz durumlarını (açık/kapalı, klima sıcaklığı) döndürür.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

interface ToolResponse {
  ok: boolean;
  message: string;
  data?: unknown;
}

async function callTuyaApi(
  tuyaDeviceId: string,
  action: 'on' | 'off' | 'status',
): Promise<ToolResponse> {
  try {
    const res = await fetch('/api/tuya-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: tuyaDeviceId, action }),
    });
    if (!res.ok) {
      return { ok: false, message: `Tuya API hatası: HTTP ${res.status}` };
    }
    return (await res.json()) as ToolResponse;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Tuya bağlantı hatası: ${msg}` };
  }
}

export async function executeSmartHomeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResponse> {
  const store = useDevicesStore.getState();

  if (name === 'set_device_power') {
    const room = String(args.room ?? '');
    const device = String(args.device ?? '') as DeviceKind;
    const on = Boolean(args.on);
    if (!ROOM_IDS.includes(room as (typeof ROOM_IDS)[number])) {
      return { ok: false, message: `Bilinmeyen oda: ${room}` };
    }
    if (!DEVICE_KINDS.includes(device)) {
      return { ok: false, message: `Bilinmeyen cihaz: ${device}` };
    }

    if (device === 'plug') {
      const roomData = store.rooms.find((r) => r.id === room);
      const plugDevice = roomData?.devices.find((d) => d.kind === 'plug');
      if (!plugDevice?.tuyaDeviceId) {
        return { ok: false, message: 'Bu odada Tuya bağlantılı priz bulunamadı.' };
      }
      const tuyaResult = await callTuyaApi(plugDevice.tuyaDeviceId, on ? 'on' : 'off');
      if (tuyaResult.ok) {
        store.setDeviceOn(room, device, on);
      }
      const roomLabel = roomData?.label ?? room;
      tuyaResult.message = tuyaResult.ok
        ? `${roomLabel} Akıllı Priz ${on ? 'açıldı' : 'kapatıldı'}.`
        : tuyaResult.message;
      return tuyaResult;
    }

    const changed = store.setDeviceOn(room, device, on);
    const roomLabel =
      store.rooms.find((r) => r.id === room)?.label ?? room;
    const deviceLabel = DEVICE_KIND_LABEL[device] ?? device;
    return {
      ok: true,
      message: changed
        ? `${roomLabel} ${deviceLabel} ${on ? 'açıldı' : 'kapatıldı'}.`
        : `${roomLabel} ${deviceLabel} zaten ${on ? 'açık' : 'kapalı'}.`,
      data: { room, device, on, changed },
    };
  }

  if (name === 'set_ac_temperature') {
    const room = String(args.room ?? '');
    const temperature = Number(args.temperature ?? NaN);
    if (!ROOM_IDS.includes(room as (typeof ROOM_IDS)[number])) {
      return { ok: false, message: `Bilinmeyen oda: ${room}` };
    }
    if (!Number.isFinite(temperature) || temperature < 16 || temperature > 30) {
      return {
        ok: false,
        message: 'Sıcaklık 16 ile 30 °C arasında olmalı.',
      };
    }
    const changed = store.setAcTemperature(room, temperature);
    const roomLabel =
      store.rooms.find((r) => r.id === room)?.label ?? room;
    return {
      ok: true,
      message: `${roomLabel} klima ${temperature} °C olarak ayarlandı.`,
      data: { room, temperature, changed },
    };
  }

  if (name === 'get_home_status') {
    return {
      ok: true,
      message: 'Ev durumu döndürüldü.',
      data: store.rooms.map((room) => ({
        id: room.id,
        label: room.label,
        devices: room.devices.map((device) => ({
          kind: device.kind,
          label: device.label,
          on: device.on,
          temperature: device.temperature,
        })),
      })),
    };
  }

  return { ok: false, message: `Bilinmeyen araç: ${name}` };
}
