import { NextResponse, type NextRequest } from 'next/server';
import { tuyaControl } from '@/lib/tuya/tuya-client';

interface TuyaRequestBody {
  deviceId: string;
  action: 'on' | 'off' | 'status';
}

const VALID_ACTIONS = new Set(['on', 'off', 'status']);

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
        { ok: false, message: 'Geçersiz aksiyon. "on", "off" veya "status" olmalı.' },
        { status: 400 },
      );
    }

    const result = await tuyaControl(body.deviceId, body.action);

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Tuya kontrol hatası';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
