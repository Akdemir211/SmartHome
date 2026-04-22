import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'GEMINI_API_KEY boş.',
    });
  }

  const info = {
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 4) + '...',
    looksLikeGeminiKey: apiKey.startsWith('AIzaSy'),
    looksLikeOAuth: apiKey.startsWith('AQ.'),
  };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Merhaba, sadece "OK" yaz.',
    });
    const text = res.text?.trim() ?? '';
    return NextResponse.json({
      ok: true,
      keyInfo: info,
      testResponse: text.substring(0, 100),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      keyInfo: info,
      error: message,
    });
  }
}
