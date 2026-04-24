import { NextResponse, type NextRequest } from 'next/server';
import { tuyaControl, type TuyaDeviceType, type BulbState } from '@/lib/tuya/tuya-client';

interface TuyaRequestBody {
  deviceId: string;
  action: 'on' | 'off' | 'status' | 'set_bulb_state';
  deviceType?: TuyaDeviceType;
  bulbState?: BulbState;
}

const VALID_ACTIONS = new Set(['on', 'off', 'status', 'set_bulb_state']);
const VALID_DEVICE_TYPES = new Set<TuyaDeviceType>(['plug', 'bulb']);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TuyaRequestBody;

    if (!body.deviceId) {
      return NextResponse.json(
        { ok: false, message: 'deviceId gerekli.' },
        { status: 400 },
      );
    }

    if (!body.action || !VALID_ACTIONS.has(body.action)) {
      return NextResponse.json(
        { ok: false, message: 'Geçersiz aksiyon.' },
        { status: 400 },
      );
    }

    const deviceType: TuyaDeviceType =
      body.deviceType && VALID_DEVICE_TYPES.has(body.deviceType)
        ? body.deviceType
        : 'plug';

    const result = await tuyaControl(body.deviceId, body.action, deviceType, body.bulbState);

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Tuya kontrol hatası';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
