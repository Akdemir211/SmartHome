import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jarvis — Akıllı Ev Asistanı',
  description:
    'Gemini tabanlı, sesli komutlarla çalışan 3D akıllı ev asistanı arayüzü.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-navy-deep text-slate-200 antialiased">{children}</body>
    </html>
  );
}
