import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORT_PROMPT = `Sen "Alex Destek" adlı bir yapay zeka teknik destek asistanısın. 
Görevin Alex Smart Home kullanıcılarına karşılaştıkları sorunlarda yardımcı olmak.

Uzmanlık alanların:
- Akıllı ev cihazları (ampuller, prizler, klimalar, sensörler)
- Wi-Fi bağlantı sorunları
- Cihaz eşleştirme ve kurulum
- Tuya tabanlı cihaz entegrasyonu
- Uygulama giriş ve hesap sorunları
- Otomasyon ve senaryo kurulumu

Kurallar:
- Kısa, net ve anlaşılır yanıtlar ver (maksimum 3-4 cümle).
- Adım adım çözüm sun.
- Türkçe yanıt ver.
- Sorunu çözemiyorsan kullanıcıyı destek ekibine yönlendir.
- Samimi ama profesyonel ol.`;

interface SupportRequest {
  message?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: 'Yapay zeka servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' },
      { status: 200 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as SupportRequest;
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json(
      { reply: 'Lütfen sorununuzu yazın.' },
      { status: 200 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: SUPPORT_PROMPT,
      },
    });
    const reply = response.text ?? 'Yanıt alınamadı.';
    return NextResponse.json({ reply });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[AiSupport]', errMsg);
    return NextResponse.json(
      { reply: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 200 },
    );
  }
}
