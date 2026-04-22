import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Gemini Live API için bağlantı bilgilerini client'a döndürür.
 * Kişisel/localhost projesi olduğundan API key sunucu üzerinden aktarılıyor.
 * Üretim ortamına alınırsa auth middleware eklenmeli.
 */
export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY ayarlanmamış. .env.local dosyasını kontrol edin.' },
      { status: 500 },
    );
  }

  const model =
    process.env.GEMINI_MODEL?.trim() ??
    'gemini-3.1-flash-live-preview';

  return NextResponse.json({
    token: apiKey,
    model,
    expireAt: Date.now() + 30 * 60 * 1000,
  });
}
