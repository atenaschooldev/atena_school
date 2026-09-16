import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Atena School',
  description: 'Completa la tua prenotazione con Atena School.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
