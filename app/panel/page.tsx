'use client'

import { useState, useCallback } from 'react'
import { SplineScene } from '@/components/ui/splite'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { SpotlightCursor } from '@/components/ui/spotlight-cursor'
import { FloatingElements } from '@/components/ui/floating-elements'
import { HelpCircle, MessageCircle, Send, Bot, X, ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CardStackScroll, CardsContainer, CardTransformed, ReviewStars } from '@/components/ui/animated-cards-stack'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import { TypewriterEffect } from '@/components/ui/typewriter-effect'

const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Ahmet K.",
    profession: "Yazılım Mühendisi",
    rating: 5,
    description:
      "Alex ile evimi sesli komutlarla kontrol etmek hayatımı inanılmaz kolaylaştırdı. Kurulum çok basit, kullanım çok akıcı.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-2",
    name: "Elif M.",
    profession: "İç Mimar",
    rating: 4.5,
    description:
      "Akıllı ev sistemlerini müşterilerime hep öneriyorum. Alex'in arayüzü ve kullanım kolaylığı rakiplerinden çok önde.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-3",
    name: "Burak S.",
    profession: "Girişimci",
    rating: 5,
    description:
      "Tüm cihazlarımı tek panelden yönetebiliyorum. QR ile giriş özelliği de müthiş pratik. Kesinlikle tavsiye ederim!",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
  },
  {
    id: "testimonial-4",
    name: "Zeynep A.",
    profession: "Öğretim Görevlisi",
    rating: 5,
    description:
      "Sesli komut desteği mükemmel çalışıyor. 'Hey Alex' diyorum ve ışıklar kapanıyor. Teknoloji bu kadar kolay olmalı.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop",
  },
]

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function AiSupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Bir hata oluştu.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.' }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-jarvis-purple/30 bg-navy-deep/80 backdrop-blur-md px-5 py-3 shadow-lg transition hover:border-jarvis-purple/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
      >
        <MessageCircle className="h-5 w-5 text-jarvis-cyan" />
        <span className="text-sm font-medium text-white">Yardım & Destek</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-white/10 bg-navy-deep/95 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-jarvis-purple/20">
            <Bot className="h-4 w-4 text-jarvis-cyan" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Alex Destek</span>
            <p className="text-[10px] text-neutral-500">Yapay Zeka Destekli Yardım</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[300px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jarvis-purple/10 mb-4">
              <Bot className="h-6 w-6 text-jarvis-violet" />
            </div>
            <p className="text-sm text-neutral-400 max-w-[250px]">
              Merhaba! Karşılaştığınız sorunu yazın, size yardımcı olayım.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-jarvis-purple/30 text-white rounded-br-sm'
                : 'bg-white/[0.05] text-neutral-200 border border-white/10 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-jarvis-purple/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-jarvis-purple/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-jarvis-purple/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Sorununuzu yazın..."
            className="flex-1 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-jarvis-purple/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-jarvis-purple/30 text-jarvis-cyan transition hover:bg-jarvis-purple/50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PanelPage() {
  const [isPanelVisible, setIsPanelVisible] = useState(false)

  return (
    <div className="w-full bg-navy-deep">
      <SpotlightCursor config={{ radius: 300, brightness: 0.35, color: '#7c3aed' }} />
      <AiSupportChat />

      {/* Arka plan — erken kayıt sayfasıyla aynı, fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black/[0.96]">
        <FloatingElements />
        <div className="absolute inset-0 bg-gradient-to-br from-jarvis-purple/20 via-transparent to-jarvis-violet/10" />
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#7c3aed"
        />
      </div>

      {/* Robot — fixed, büyütülmüş, bacaklar gizli */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden opacity-40">
        <div className="w-full h-full scale-[2.3] translate-y-[50%]">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Hero Bölümü — ilk ekran */}
      <section className="relative z-10 h-screen w-full">
        <Card className="w-full h-full bg-transparent border-0 relative overflow-hidden rounded-none">

          {/* Hoşgeldiniz içeriği */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-in-out"
            style={{ transform: isPanelVisible ? 'translateX(-100%)' : 'translateX(0)' }}
          >
            <div className="flex flex-col items-center text-center px-8 max-w-4xl">
              <TypewriterEffect
                words={[
                  { text: "Eviniz,", className: "!text-white font-bold" },
                  { text: "Sesinizle", className: "!text-white font-bold" },
                  { text: "Yönetilsin.", className: "!text-jarvis-purple font-bold" },
                ]}
                className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl"
                cursorClassName="bg-jarvis-purple h-8 md:h-10 lg:h-14"
              />

              <p className="mt-8 text-neutral-400 max-w-2xl text-xl md:text-2xl leading-relaxed">
                Tüm akıllı cihazlarınızı tek bir panelden yönetin. Yapay zeka destekli, güvenli ve hızlı.
              </p>

              <div className="mt-12 pointer-events-auto">
                <button
                  onClick={() => setIsPanelVisible(true)}
                  className="group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-jarvis-purple/20 to-jarvis-violet/20 font-medium text-neutral-200 border-2 border-jarvis-purple/50 transition-all duration-300 hover:w-44 hover:border-jarvis-purple hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:-translate-x-3 group-hover:opacity-100">
                    Panele Git
                  </div>
                  <div className="absolute right-3.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Panel bölümü — sağdan gelir */}
          <div
            className="absolute inset-0 z-10 flex items-center justify-center transition-transform duration-700 ease-in-out"
            style={{ transform: isPanelVisible ? 'translateX(0)' : 'translateX(100%)' }}
          >
            <div className="w-full max-w-2xl px-8 pointer-events-auto">
              <div className="mb-6">
                <button
                  onClick={() => setIsPanelVisible(false)}
                  className="group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-jarvis-purple/20 to-jarvis-violet/20 font-medium text-neutral-200 border-2 border-jarvis-purple/50 transition-all duration-300 hover:w-36 hover:border-jarvis-purple hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-3 group-hover:opacity-100">
                    Geri
                  </div>
                  <div className="absolute left-3.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 rotate-180"
                    >
                      <path
                        d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-300 to-neutral-500 mb-6">
                Kontrol Paneli
              </h2>
              <p className="text-neutral-400 text-lg mb-8">
                Cihazlarınızı buradan yönetin. Yakında burada odalarınız ve cihazlarınız yer alacak.
              </p>

              <div className="rounded-2xl border border-jarvis-purple/20 bg-navy-deep/60 backdrop-blur-sm p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jarvis-purple/10 mx-auto mb-4">
                  <ArrowRight className="h-7 w-7 text-jarvis-violet" />
                </div>
                <p className="text-neutral-300 text-lg font-medium">Panel Yakında Aktif</p>
                <p className="text-neutral-500 text-sm mt-2">
                  Cihaz yönetim paneli geliştirme aşamasında. Çok yakında burada olacak.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll göstergesi */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce transition-opacity duration-500"
            style={{ opacity: isPanelVisible ? 0 : 1 }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500">Aşağı Kaydır</span>
              <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </Card>
      </section>

      {/* Kullanıcı Yorumları — Kart Yığını */}
      <section className="relative z-10">
        <CardStackScroll className="h-[200vh]">
          <div className="sticky left-0 top-0 h-svh w-full flex items-center">
            <div className="w-full max-w-7xl ml-0 mr-auto px-8 md:pl-16 lg:pl-24 flex items-center">
              {/* Sol — Memnuniyet metni */}
              <div className="flex-1 pr-12 hidden md:block">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-300 to-neutral-500 leading-normal pb-1">
                  Kullanıcılarımız
                  <br />
                  Çok Memnun
                </h2>
                <p className="mt-5 text-neutral-400 max-w-lg text-lg md:text-xl leading-relaxed">
                  Binlerce kullanıcı Alex Smart Home ile evlerini sesle kontrol ediyor.
                  %98 memnuniyet oranıyla akıllı ev deneyiminin en iyisini sunuyoruz.
                </p>
                <div className="mt-10 flex items-center gap-8">
                  <div>
                    <span className="text-4xl font-bold text-jarvis-cyan">%98</span>
                    <p className="text-sm text-neutral-500 mt-1">Memnuniyet</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div>
                    <span className="text-4xl font-bold text-jarvis-violet">4.9/5</span>
                    <p className="text-sm text-neutral-500 mt-1">Ortalama Puan</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div>
                    <span className="text-4xl font-bold text-white">2K+</span>
                    <p className="text-sm text-neutral-500 mt-1">Aktif Kullanıcı</p>
                  </div>
                </div>
              </div>

              {/* Sağ — Kart yığını */}
              <div className="flex-1 flex justify-end mr-[-12rem]">
                <CardsContainer className="h-[550px] w-[420px]">
                  {TESTIMONIALS.map((testimonial, index) => (
                    <CardTransformed
                      arrayLength={TESTIMONIALS.length}
                      key={testimonial.id}
                      variant="dark"
                      index={index + 2}
                      role="article"
                      className="border-jarvis-purple/30 bg-navy-deep/90"
                    >
                      <div className="flex flex-col items-center space-y-4 text-center">
                        <ReviewStars
                          className="text-jarvis-cyan"
                          rating={testimonial.rating}
                        />
                        <div className="mx-auto w-4/5 text-lg text-white">
                          <blockquote>&ldquo;{testimonial.description}&rdquo;</blockquote>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Avatar className="!size-12 border border-jarvis-purple/40">
                          <AvatarImage
                            src={testimonial.avatarUrl}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="block text-lg font-semibold tracking-tight text-white">
                            {testimonial.name}
                          </span>
                          <span className="block text-sm text-neutral-400">
                            {testimonial.profession}
                          </span>
                        </div>
                      </div>
                    </CardTransformed>
                  ))}
                </CardsContainer>
              </div>
            </div>
          </div>
        </CardStackScroll>
      </section>

      {/* Bir Sorun mu Yaşıyorsunuz? */}
      <section className="relative z-10 py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-7 w-7 text-jarvis-violet" />
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Bir Sorun mu Yaşıyorsunuz?
            </h2>
          </div>
          <p className="text-lg text-neutral-400 text-center mb-10">
            Sıkça karşılaşılan sorunlar ve çözümleri
          </p>

          <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="1">
            <AccordionItem
              value="1"
              className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm px-5 py-1"
            >
              <AccordionTrigger className="py-4 text-[15px] leading-6 text-white hover:no-underline">
                Cihazım Wi-Fi ağına bağlanmıyor
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-neutral-400 text-sm leading-relaxed">
                Cihazınızın 2.4 GHz Wi-Fi ağına bağlı olduğundan emin olun (5 GHz desteklenmez).
                Cihazı kapatıp 10 saniye bekledikten sonra tekrar açın.
                Router&apos;ınızı yeniden başlatın ve cihazı sıfırlayıp yeniden eşleştirin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="2"
              className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm px-5 py-1"
            >
              <AccordionTrigger className="py-4 text-[15px] leading-6 text-white hover:no-underline">
                Cihaz komutlara yanıt vermiyor
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-neutral-400 text-sm leading-relaxed">
                Cihazın internet bağlantısını kontrol edin. Panelden cihazı kaldırıp yeniden ekleyin.
                Firmware güncellemesi varsa uygulayın. Elektrik kesintisi sonrası cihaz sıfırlanmış olabilir.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="3"
              className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm px-5 py-1"
            >
              <AccordionTrigger className="py-4 text-[15px] leading-6 text-white hover:no-underline">
                Panele giriş yapamıyorum
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-neutral-400 text-sm leading-relaxed">
                E-posta adresinizi ve şifrenizi doğru girdiğinizden emin olun.
                Şifrenizi unuttuysanız sıfırlama bağlantısını kullanın.
                Alternatif olarak QR kod ile hızlı giriş deneyebilirsiniz.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="4"
              className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm px-5 py-1"
            >
              <AccordionTrigger className="py-4 text-[15px] leading-6 text-white hover:no-underline">
                Sesli komutlar çalışmıyor
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-neutral-400 text-sm leading-relaxed">
                Mikrofon izninin verildiğinden emin olun. Tarayıcı ayarlarından mikrofon erişimini kontrol edin.
                &quot;Hey Alex&quot; diyerek asistanı uyandırın. Sessiz bir ortamda deneyin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="5"
              className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm px-5 py-1"
            >
              <AccordionTrigger className="py-4 text-[15px] leading-6 text-white hover:no-underline">
                Yeni cihaz nasıl eklerim?
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-neutral-400 text-sm leading-relaxed">
                Paneldeki &quot;Oda Ekle&quot; veya ilgili odadaki &quot;Cihaz Ekle&quot; butonuna tıklayın.
                Tuya uygulamasından cihazınızı eşleştirdikten sonra otomatik olarak panelde görünecektir.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
