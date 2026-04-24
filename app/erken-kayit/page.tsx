'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SplineScene } from '@/components/ui/splite'
import type { SplineSceneHandle } from '@/components/ui/splite'
import { Card } from '@/components/ui/card'
import { Spotlight } from '@/components/ui/spotlight'
import { SpotlightCursor } from '@/components/ui/spotlight-cursor'
import { FloatingElements } from '@/components/ui/floating-elements'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import MotionButton from '@/components/ui/motion-button'

export default function ErkenKayitPage() {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const splineRef = useRef<SplineSceneHandle>(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => splineRef.current?.resize(), 100),
      setTimeout(() => splineRef.current?.resize(), 400),
      setTimeout(() => splineRef.current?.resize(), 750),
      setTimeout(() => splineRef.current?.resize(), 1000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isFormVisible])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name) return

    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/early-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.message ?? 'Bir hata oluştu.')
        return
      }

      setIsSubmitted(true)
    } catch {
      setErrorMsg('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }, [email, name])

  return (
    <div className="h-screen w-screen bg-navy-deep">
      <SpotlightCursor config={{ radius: 300, brightness: 0.35, color: '#7c3aed' }} />
      <Card className="w-full h-full bg-black/[0.96] border-jarvis-purple/20 relative overflow-hidden rounded-none border-0">
        <FloatingElements />
        <div className="absolute inset-0 bg-gradient-to-br from-jarvis-purple/20 via-transparent to-jarvis-violet/10 pointer-events-none" />
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#7c3aed"
        />

        {/* Robot — bağımsız katman */}
        <div
          className="absolute top-0 w-1/2 h-full z-[15] hidden md:block transition-[left,opacity] duration-700 ease-in-out"
          style={{
            left: isFormVisible ? '0%' : '50%',
            opacity: isFormVisible ? 0.6 : 1,
          }}
        >
          <SplineScene
            ref={splineRef}
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>

        <div className="absolute inset-0 z-10 flex pointer-events-none">
          {/* Hero metinleri */}
          <div
            className="absolute inset-0 flex items-center transition-transform duration-700 ease-in-out"
            style={{ transform: isFormVisible ? 'translateX(-100%)' : 'translateX(0)' }}
          >
            <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-300 to-neutral-500 leading-normal pb-1">
                Akıllı Evinizin
                <br />
                Geleceği
              </h1>
              <p className="mt-5 text-neutral-400 max-w-lg text-lg md:text-xl leading-relaxed">
                Jarvis ile evinizi sesinizle kontrol edin. Yapay zeka destekli
                akıllı ev asistanımıza erken erişim kazanın.
              </p>

              <div className="mt-8 flex flex-col gap-4 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-jarvis-purple/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-jarvis-violet" />
                  </div>
                  <span className="text-base md:text-lg text-neutral-300">
                    <strong className="text-white">21 gün ücretsiz</strong> tam erişim
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-jarvis-purple/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-jarvis-violet" />
                  </div>
                  <span className="text-base md:text-lg text-neutral-300">
                    Erken kayıt üyelerine <strong className="text-white">özel indirimler</strong>
                  </span>
                </div>
              </div>

              <div className="mt-10 pointer-events-auto">
                <MotionButton
                  label="Erken Erişim Kaydı"
                  onClick={() => setIsFormVisible(true)}
                  classes="w-64"
                />
              </div>
            </div>
          </div>

          {/* Kayıt Formu */}
          <div
            className="absolute inset-0 flex items-center justify-end transition-transform duration-700 ease-in-out"
            style={{ transform: isFormVisible ? 'translateX(0)' : 'translateX(100%)' }}
          >
            <div className="w-full md:w-1/2 max-w-lg px-8 md:ml-auto md:mr-24 pointer-events-auto border border-jarvis-purple/20 rounded-2xl p-14 bg-navy-deep/40 backdrop-blur-sm">
              <div className="mb-10 -ml-4">
                <MotionButton
                  label="Geri"
                  direction="left"
                  onClick={() => { setIsFormVisible(false); setIsSubmitted(false) }}
                  classes="w-40 h-12"
                />
              </div>

              {isSubmitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-300 mb-3">
                    Kayıt Başarılı!
                  </h2>
                  <p className="text-neutral-400 leading-relaxed">
                    <span className="text-jarvis-glow font-medium">{name}</span>,
                    erken erişim listemize eklendiniz.
                    <br />
                    Lansman öncesi sizi bilgilendireceğiz.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-4xl md:text-5xl font-bold text-neutral-300 mb-3 text-center">
                    Erken Kayıt
                  </h2>
                  <p className="text-lg text-neutral-500 mb-12">
                    Herkesten önce deneyimleyin. Sınırlı kontenjan.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="relative">
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder=" "
                        className="peer w-full bg-transparent border-b border-neutral-700 focus:border-jarvis-purple text-white text-xl py-4 outline-none transition-colors"
                      />
                      <label
                        htmlFor="name"
                        className="absolute left-0 top-4 text-neutral-500 text-xl transition-all peer-focus:-top-6 peer-focus:text-sm peer-focus:text-jarvis-violet peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-jarvis-violet"
                      >
                        Ad Soyad
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        className="peer w-full bg-transparent border-b border-neutral-700 focus:border-jarvis-purple text-white text-xl py-4 outline-none transition-colors"
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-0 top-4 text-neutral-500 text-xl transition-all peer-focus:-top-6 peer-focus:text-sm peer-focus:text-jarvis-violet peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-jarvis-violet"
                      >
                        E-posta Adresi
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full h-14 mt-4 cursor-pointer rounded-full bg-[#3b4872] p-1 outline-none overflow-hidden disabled:opacity-50 transition-opacity"
                    >
                      <div className="absolute top-1/2 left-[1.1rem] -translate-y-1/2">
                        {isLoading ? (
                          <span className="loader !w-5 !h-5 !border-2" />
                        ) : (
                          <ArrowRight className="size-5 text-white" />
                        )}
                      </div>
                      <span className="relative z-10 ml-6 text-lg font-medium tracking-tight text-white">
                        Kaydı Tamamla
                      </span>
                    </button>
                  </form>

                  {errorMsg && (
                    <p className="text-sm text-red-400 mt-4 text-center">
                      {errorMsg}
                    </p>
                  )}

                  <p className="text-xs text-neutral-600 mt-6 text-center">
                    Kaydınızla birlikte gizlilik politikamızı kabul etmiş olursunuz.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
