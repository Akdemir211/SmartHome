'use client';

import { Orbitron } from 'next/font/google';
import { useState } from 'react';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-orbitron',
});

export function EarlyAccessForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim() || undefined }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      setStatus('success');
      setMessage(data.message ?? 'Kaydınız alındı.');
      setEmail('');
      setName('');
    } catch {
      setStatus('error');
      setMessage('Bağlantı hatası. İnternetinizi kontrol edip tekrar deneyin.');
    }
  }

  return (
    <div
      className={`relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-16 sm:py-24 ${orbitron.variable}`}
    >
      <div
        className="w-full rounded-2xl border border-cyan-400/25 bg-slate-950/45 p-[1px] shadow-[0_0_60px_-12px_rgba(56,189,248,0.55)] backdrop-blur-xl"
        style={{
          transform: 'perspective(1200px) rotateX(4deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="rounded-[0.95rem] bg-gradient-to-br from-white/[0.08] to-transparent px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-center font-[family-name:var(--font-orbitron)] text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-cyan-200/90">
            Jarvis
          </p>
          <h1 className="mt-3 text-center font-[family-name:var(--font-orbitron)] text-xl font-bold tracking-tight text-white sm:text-2xl">
            Erken Erişim
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-300/95">
            Projeyi ilk deneyimleyenlerden olun. Kayıt olan kullanıcılar tam sürüm yayınlanana kadar
            öncelikli erişim kazanır.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="ea-name" className="mb-1.5 block text-xs font-medium text-slate-400">
                Ad Soyad <span className="text-slate-500">(isteğe bağlı)</span>
              </label>
              <input
                id="ea-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-cyan-400/30 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2"
                placeholder="Adınız"
              />
            </div>
            <div>
              <label htmlFor="ea-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                E-posta
              </label>
              <input
                id="ea-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-cyan-400/30 placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2"
                placeholder="ornek@eposta.com"
              />
            </div>

            {message ? (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : 'bg-rose-500/15 text-rose-200'
                }`}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 py-3.5 font-[family-name:var(--font-orbitron)] text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0_32px_-4px_rgba(34,211,238,0.65)] transition hover:shadow-[0_0_48px_-2px_rgba(56,189,248,0.85)] disabled:opacity-60"
            >
              {status === 'loading' ? 'Gönderiliyor…' : 'Geleceğe Katıl'}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-slate-500">
            Kayıt olmayan kullanıcılar projenin genel yayınını bekleyecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
