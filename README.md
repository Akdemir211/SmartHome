# Jarvis Akıllı Ev Asistanı

"Hey Jarvis" komutuyla tetiklenen, Gemini Live API ile gerçek zamanlı sesli sohbet eden, 3D partikül kürenin AI sesine göre tepki verdiği minimalist bir akıllı ev asistanı web arayüzü.

## Stack

- Next.js 14 (App Router) + TypeScript
- React Three Fiber + drei + postprocessing (Bloom)
- Zustand (asistan FSM + cihaz store)
- Gemini Live API (`@google/genai`)
- Web Speech API (wake word)
- Web Audio API (FFT analiz)
- Tailwind CSS

## Kuruluma

```bash
npm install
cp .env.local.example .env.local
# .env.local içine GEMINI_API_KEY ekleyin
npm run dev
```

Tarayıcı `http://localhost:3000` adresine gidip mikrofon iznini verdiğinizde asistan "Hoşgeldiniz efendim..." diye karşılayacak.

## Ortam Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio API anahtarı (sunucu tarafı, asla client'a düşmez) |
| `GEMINI_MODEL` | Live API modeli (default: `gemini-2.5-flash-preview-native-audio-dialog`) |
| `GEMINI_TEXT_MODEL` | Fallback metin modeli |

## Komut Örnekleri

- "Hey Jarvis, oturma odasındaki ışığı kapat"
- "Hey Jarvis, klimayı 22 dereceye ayarla"
- "Hey Jarvis, yatak odasında ne durumda?"

## Klasör Yapısı

Detaylı mimari için `.cursor/plans/` altındaki plan dosyasına bakın.
