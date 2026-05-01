'use client'

import { SplineScene } from '@/components/ui/splite'
import { FloatingElements } from '@/components/ui/floating-elements'
import { Spotlight } from '@/components/ui/spotlight'
import { SpotlightCursor } from '@/components/ui/spotlight-cursor'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { Home, Lightbulb, Thermometer, Wifi, Shield, Smartphone } from 'lucide-react'

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-jarvis-purple/30 hover:bg-white/[0.06]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-jarvis-purple/20 to-jarvis-cyan/10">
        <Icon className="h-6 w-6 text-jarvis-cyan" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-center text-sm leading-relaxed text-neutral-400">{description}</p>
    </div>
  )
}

export default function PanelPage() {
  return (
    <div className="relative min-h-screen w-full bg-navy-deep overflow-x-hidden">
      <SpotlightCursor config={{ radius: 300, brightness: 0.35, color: '#7c3aed' }} />

      {/* Uzay arka planı */}
      <div className="fixed inset-0 z-0">
        <FloatingElements />
        <div className="absolute inset-0 bg-gradient-to-br from-jarvis-purple/20 via-transparent to-jarvis-violet/10 pointer-events-none" />
      </div>

      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#7c3aed"
      />

      {/* Robot — merkezde */}
      <div className="fixed inset-0 z-[5] pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-40">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* İçerik */}
      <div className="relative z-10">
        {/* Hero Bölümü */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-jarvis-purple/30 bg-jarvis-purple/10 px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-jarvis-cyan animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-widest text-jarvis-cyan">
              Alex Smart Home
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
              Akıllı Evinizi
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-jarvis-purple to-jarvis-cyan">
              Kontrol Paneli
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
            Tüm akıllı cihazlarınızı tek bir yerden yönetin.
            Odalarınızı düzenleyin, cihaz ekleyin ve Alex ile sesli kontrol edin.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-jarvis-purple to-jarvis-cyan px-8 py-3.5 text-sm font-medium text-white shadow-lg transition hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]">
              <Home className="h-4 w-4" />
              Panele Giriş Yap
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10">
              <Smartphone className="h-4 w-4" />
              QR ile Hızlı Giriş
            </button>
          </div>

          {/* Scroll göstergesi */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-neutral-500">Keşfet</span>
              <svg className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Scroll Animasyonlu Dashboard Önizleme */}
        <ContainerScroll
          titleComponent={
            <>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                Evinizi Tek Ekrandan Yönetin
              </h2>
              <p className="mt-3 text-lg text-neutral-400">
                Tüm cihazlarınız, odalarınız ve otomasyonlarınız bir arada
              </p>
            </>
          }
        >
          {/* Dashboard mockup */}
          <div className="flex h-full w-full flex-col gap-4 bg-navy-deep p-4 md:p-8">
            {/* Üst bar */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-jarvis-purple" />
                <span className="text-sm font-medium text-white">Alex Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-jarvis-purple/20" />
              </div>
            </div>

            {/* Oda kartları */}
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
              {/* Oda 1 */}
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Oturma Odası</span>
                  <span className="text-xs text-jarvis-cyan">4 cihaz</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-jarvis-purple/20 p-3 text-center">
                    <Lightbulb className="mx-auto h-5 w-5 text-jarvis-violet" />
                    <span className="mt-1 block text-[10px] text-neutral-300">Işık</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <Thermometer className="mx-auto h-5 w-5 text-neutral-500" />
                    <span className="mt-1 block text-[10px] text-neutral-400">Klima</span>
                  </div>
                </div>
              </div>

              {/* Oda 2 */}
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Yatak Odası</span>
                  <span className="text-xs text-jarvis-cyan">3 cihaz</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-jarvis-cyan/20 p-3 text-center">
                    <Lightbulb className="mx-auto h-5 w-5 text-jarvis-cyan" />
                    <span className="mt-1 block text-[10px] text-neutral-300">Ampul</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <Wifi className="mx-auto h-5 w-5 text-neutral-500" />
                    <span className="mt-1 block text-[10px] text-neutral-400">Priz</span>
                  </div>
                </div>
              </div>

              {/* Oda 3 */}
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Mutfak</span>
                  <span className="text-xs text-jarvis-cyan">2 cihaz</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/5 p-3 text-center">
                    <Lightbulb className="mx-auto h-5 w-5 text-neutral-500" />
                    <span className="mt-1 block text-[10px] text-neutral-400">Işık</span>
                  </div>
                  <div className="rounded-lg bg-jarvis-purple/20 p-3 text-center">
                    <Wifi className="mx-auto h-5 w-5 text-jarvis-violet" />
                    <span className="mt-1 block text-[10px] text-neutral-300">Priz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>

        {/* Özellikler Bölümü */}
        <section className="mx-auto max-w-6xl px-6 pb-32">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Neler Yapabilirsiniz?
            </h2>
            <p className="mt-3 text-neutral-400">
              Alex Smart Home ile evinizin tam kontrolü sizde
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Lightbulb}
              title="Cihaz Kontrolü"
              description="Işıklar, prizler, ampuller — tüm akıllı cihazlarınızı tek dokunuşla yönetin."
            />
            <FeatureCard
              icon={Home}
              title="Oda Yönetimi"
              description="Odalarınızı oluşturun ve cihazlarınızı organize edin."
            />
            <FeatureCard
              icon={Wifi}
              title="Otomatik Keşif"
              description="Tuya hesabınızı bağlayın, cihazlarınız otomatik eklensin."
            />
            <FeatureCard
              icon={Shield}
              title="Güvenli Bağlantı"
              description="Verileriniz şifreli, cihaz anahtarlarınız güvende."
            />
            <FeatureCard
              icon={Thermometer}
              title="Klima & Sıcaklık"
              description="Oda sıcaklığını sesli komutla veya panelden ayarlayın."
            />
            <FeatureCard
              icon={Smartphone}
              title="QR ile Hızlı Erişim"
              description="QR kodunuzu tarayın, anında panelinize erişin."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
