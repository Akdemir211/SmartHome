import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PREVIEW_TEXT = 'Merhaba efendim, size nasıl yardımcı olabilirim?';

export async function POST(req: Request) {
  try {
    const { voiceName } = (await req.json()) as { voiceName?: string };
    if (!voiceName) {
      return NextResponse.json({ error: 'voiceName gerekli' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key yok' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ role: 'user', parts: [{ text: PREVIEW_TEXT }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const inlineData = part?.inlineData;

    if (!inlineData?.data) {
      return NextResponse.json({ error: 'Ses üretilemedi' }, { status: 500 });
    }

    const audioBuffer = Buffer.from(inlineData.data, 'base64');

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': inlineData.mimeType || 'audio/L16;rate=24000',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
