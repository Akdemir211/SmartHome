# Alex Smart Home — Akıllı Ev Asistanı

"Hey Alex" komutuyla tetiklenen, Gemini Live API ile gerçek zamanlı sesli sohbet eden, 3D partikül kürenin AI sesine göre tepki verdiği minimalist bir akıllı ev asistanı web arayüzü.

## Özellikler

- **Sesli Asistan**: "Hey Alex" ile uyandırılan, doğal dilde sesli komut desteği
- **Akıllı Cihaz Kontrolü**: Tuya uyumlu akıllı cihazları sesle ve panelden yönetme
- **3D Arayüz**: React Three Fiber ile oluşturulmuş interaktif partikül küre ve Spline 3D robot
- **AI Teknik Destek**: Yapay zeka destekli canlı destek sohbeti
- **Erken Kayıt Sistemi**: Supabase entegrasyonlu erken kayıt sayfası
- **Panel Arayüzü**: Scroll animasyonları, kullanıcı yorumları ve SSS bölümüyle zengin tanıtım paneli

## Stack

- Next.js 14 (App Router) + TypeScript
- React Three Fiber + drei + postprocessing (Bloom)
- Framer Motion (scroll animasyonları, typewriter efektleri)
- Spline 3D (interaktif robot modeli)
- Zustand (asistan FSM + cihaz store)
- Gemini Live API (`@google/genai`)
- Web Speech API (wake word)
- Web Audio API (FFT analiz)
- Supabase (veritabanı + kimlik doğrulama)
- Radix UI (Accordion, Avatar)
- Tailwind CSS

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local içine gerekli değişkenleri ekleyin
npm run dev
```

Tarayıcı `http://localhost:3000` adresine gidip mikrofon iznini verdiğinizde asistan "Hoşgeldiniz efendim..." diye karşılayacak.

## Ortam Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio API anahtarı (sunucu tarafı, asla client'a düşmez) |
| `GEMINI_MODEL` | Live API modeli (default: `gemini-3.1-flash-live-preview`) |
| `GEMINI_TEXT_MODEL` | Fallback metin modeli |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public (publishable) anahtarı |

## Komut Örnekleri

- "Hey Alex, oturma odasındaki ışığı kapat"
- "Hey Alex, klimayı 22 dereceye ayarla"
- "Hey Alex, yatak odasında ne durumda?"

## Sayfa Yapısı

| Sayfa | Yol | Açıklama |
| --- | --- | --- |
| Ana Sayfa | `/` | 3D partikül küre ve sesli asistan arayüzü |
| Erken Kayıt | `/erken-kayit` | Spline robot, uzay temalı erken kayıt formu |
| Panel | `/panel` | Tanıtım paneli — hoşgeldiniz, kullanıcı yorumları, SSS ve AI destek |

## Klasör Yapısı

```
app/
├── api/
│   ├── ai-support/      # AI teknik destek API route
│   ├── gemini/           # Gemini Live API entegrasyonu
│   └── tuya/             # Tuya cihaz kontrol API'leri
├── erken-kayit/          # Erken kayıt sayfası
├── panel/                # Panel tanıtım sayfası
└── page.tsx              # Ana sayfa (sesli asistan)
components/
└── ui/                   # Yeniden kullanılabilir UI bileşenleri
```
