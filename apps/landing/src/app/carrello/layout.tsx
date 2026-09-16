import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrello | Atena School',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
