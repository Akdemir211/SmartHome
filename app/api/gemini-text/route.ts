import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ALEX_SYSTEM_PROMPT } from '@/lib/gemini/system-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TextRequest {
  prompt?: string;
}

/**
 * Fallback: Live API devre dışı kaldığında kullanılabilecek metin endpoint'i.
 * İstemci STT'den gelen metni gönderir, sunucu Gemini'den yanıt alıp döndürür.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY ayarlanmamış.' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as TextRequest;
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json(
      { error: 'Boş istek.' },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ALEX_SYSTEM_PROMPT,
      },
    });
    const text = response.text ?? '';
    return NextResponse.json({ text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
