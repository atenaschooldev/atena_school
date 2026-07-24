import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/it.json';
import '@/index.css';
import { Nunito } from 'next/font/google';
import { Toaster } from 'sonner';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata = {
  title: 'Pannello Studente — Atena School',
  description: 'Area riservata e личный кабинет студентов и преподавателей Atena School',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning className={nunito.variable}>
      <body className="antialiased bg-[#f8f9fa] min-h-screen flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider locale="it" messages={messages as any}>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
