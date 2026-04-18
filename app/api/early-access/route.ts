import { NextResponse } from 'next/server';
import { registerEarlyAccess } from '@/lib/db/early-access-db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const email = typeof record.email === 'string' ? record.email : '';
  const name = typeof record.name === 'string' ? record.name : undefined;

  const result = registerEarlyAccess({ email, name });

  if (result.ok) {
    return NextResponse.json({
      ok: true,
      message: 'Erken erişim kaydınız alındı. Teşekkürler.',
    });
  }

  if (result.code === 'invalid_email') {
    return NextResponse.json(
      { error: 'Lütfen geçerli bir e-posta adresi girin.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Bu e-posta adresi zaten erken erişim listesinde.' },
    { status: 409 }
  );
}
