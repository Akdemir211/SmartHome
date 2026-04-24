import { Type, type FunctionDeclaration } from '@google/genai';
import type { DeviceKind } from '@/types';
import { useDevicesStore } from './devices-store';
import { DEVICE_KIND_LABEL } from './device-registry';
import { BULB_COLORS } from '@/lib/tuya/bulb-constants';

export const ROOM_IDS = ['living-room', 'bedroom', 'kitchen'] as const;
export const DEVICE_KINDS: DeviceKind[] = ['light', 'ac', 'tv', 'curtain', 'plug', 'bulb'];

export const smartHomeTools: FunctionDeclaration[] = [
  {
    name: 'set_device_power',
    description:
      'Belirtilen odadaki cihazı açar veya kapatır. Kullanıcı "ışığı kapat" derse ve odada akıllı ampul varsa, ampulü kontrol eder.',
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
    name: 'set_bulb_properties',
    description:
      'Akıllı ampulün parlaklığını, rengini veya renk sıcaklığını ayarlar. Ampulü otomatik olarak açar. Kullanıcı "ışığı kırmızı yap" derse bu aracı kullan.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        room: {
          type: Type.STRING,
          description: 'Odanın kimliği.',
          enum: [...ROOM_IDS],
        },
        brightness: {
          type: Type.NUMBER,
          description: 'Parlaklık yüzdesi (1-100). Opsiyonel.',
        },
        color: {
          type: Type.STRING,
          description: 'Renk adı. Opsiyonel.',
          enum: BULB_COLORS,
        },
        color_temperature: {
          type: Type.NUMBER,
          description: 'Renk sıcaklığı yüzdesi (0=sıcak/sarımsı, 100=soğuk/beyaz). Sadece beyaz modda geçerli. Opsiyonel.',
        },
      },
      required: ['room'],
    },
  },
  {
    name: 'set_ac_temperature',
    description: 'Belirtilen odadaki klimanın sıcaklığını ayarlar (16-30 °C).',
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
      'Evdeki tüm odaları ve cihaz durumlarını (açık/kapalı, klima sıcaklığı, ampul rengi/parlaklığı) döndürür.',
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
  action: 'on' | 'off' | 'status' | 'set_bulb_state',
  deviceType: 'plug' | 'bulb' = 'plug',
  bulbState?: { brightness?: number; color?: string; colorTemp?: number },
): Promise<ToolResponse> {
  try {
    const res = await fetch('/api/tuya-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: tuyaDeviceId, action, deviceType, bulbState }),
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

function findBulbInRoom(roomId: string) {
  const store = useDevicesStore.getState();
  const roomData = store.rooms.find((r) => r.id === roomId);
  const bulb = roomData?.devices.find((d) => d.kind === 'bulb' && d.tuyaDeviceId);
  return { roomData, bulb };
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

    // "ışık" komutu → odada akıllı ampul varsa onu kontrol et
    if (device === 'light') {
      const { roomData, bulb } = findBulbInRoom(room);
      if (bulb?.tuyaDeviceId) {
        const tuyaResult = await callTuyaApi(bulb.tuyaDeviceId, on ? 'on' : 'off', 'bulb');
        if (tuyaResult.ok) {
          store.setDeviceOn(room, 'bulb', on);
          store.setDeviceOn(room, 'light', on);
        }
        const roomLabel = roomData?.label ?? room;
        tuyaResult.message = tuyaResult.ok
          ? `${roomLabel} ışık ${on ? 'açıldı' : 'kapatıldı'}.`
          : tuyaResult.message;
        return tuyaResult;
      }
    }

    if (device === 'plug' || device === 'bulb') {
      const roomData = store.rooms.find((r) => r.id === room);
      const tuyaDevice = roomData?.devices.find((d) => d.kind === device);
      const deviceLabel = DEVICE_KIND_LABEL[device] ?? device;
      if (!tuyaDevice?.tuyaDeviceId) {
        return { ok: false, message: `Bu odada Tuya bağlantılı ${deviceLabel.toLowerCase()} bulunamadı.` };
      }
      const tuyaResult = await callTuyaApi(tuyaDevice.tuyaDeviceId, on ? 'on' : 'off', device as 'plug' | 'bulb');
      if (tuyaResult.ok) {
        store.setDeviceOn(room, device, on);
      }
      const roomLabel = roomData?.label ?? room;
      tuyaResult.message = tuyaResult.ok
        ? `${roomLabel} ${deviceLabel} ${on ? 'açıldı' : 'kapatıldı'}.`
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

  if (name === 'set_bulb_properties') {
    const room = String(args.room ?? '');
    if (!ROOM_IDS.includes(room as (typeof ROOM_IDS)[number])) {
      return { ok: false, message: `Bilinmeyen oda: ${room}` };
    }
    const { roomData, bulb } = findBulbInRoom(room);
    if (!bulb?.tuyaDeviceId) {
      return { ok: false, message: 'Bu odada akıllı ampul bulunamadı.' };
    }

    const brightness = args.brightness !== undefined ? Number(args.brightness) : undefined;
    const color = args.color !== undefined ? String(args.color) : undefined;
    const colorTemp = args.color_temperature !== undefined ? Number(args.color_temperature) : undefined;

    if (brightness !== undefined && (brightness < 1 || brightness > 100)) {
      return { ok: false, message: 'Parlaklık 1 ile 100 arasında olmalı.' };
    }
    if (colorTemp !== undefined && (colorTemp < 0 || colorTemp > 100)) {
      return { ok: false, message: 'Renk sıcaklığı 0 ile 100 arasında olmalı.' };
    }

    const bulbState = { brightness, color, colorTemp };
    const tuyaResult = await callTuyaApi(bulb.tuyaDeviceId, 'set_bulb_state', 'bulb', bulbState);

    if (tuyaResult.ok) {
      const isColor = color && color !== 'beyaz';
      store.setBulbProperties(room, {
        ...(brightness !== undefined && { brightness }),
        ...(color !== undefined && { color }),
        ...(colorTemp !== undefined && { colorTemp }),
        bulbMode: isColor ? 'colour' : 'white',
      });
      store.setDeviceOn(room, 'bulb', true);
      store.setDeviceOn(room, 'light', true);
    }

    const roomLabel = roomData?.label ?? room;
    if (tuyaResult.ok) {
      const parts: string[] = [];
      if (color) parts.push(color);
      if (brightness !== undefined) parts.push(`%${brightness} parlaklık`);
      if (colorTemp !== undefined) parts.push(`%${colorTemp} sıcaklık`);
      tuyaResult.message = `${roomLabel} ampul ayarlandı: ${parts.join(', ')}.`;
    }
    return tuyaResult;
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
          brightness: device.brightness,
          color: device.color,
          colorTemp: device.colorTemp,
          bulbMode: device.bulbMode,
        })),
      })),
    };
  }

  return { ok: false, message: `Bilinmeyen araç: ${name}` };
}
