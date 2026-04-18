import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Erken Erişim — Jarvis',
  description:
    'Jarvis akıllı ev asistanına erken erişim için kayıt olun. Kayıtlı kullanıcılar öncelikli erişim kazanır.',
};

export default function EarlyAccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
