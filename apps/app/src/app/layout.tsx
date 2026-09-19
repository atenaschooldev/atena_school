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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { DEFAULT_SCHOOL_PROFILE } from '@atena/core';

const school = DEFAULT_SCHOOL_PROFILE;

export const metadata = {
  title: `Pannello Studente — ${school.name}`,
  description: `Area riservata e portale studenti di ${school.name}`,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" translate="no" suppressHydrationWarning className={`notranslate ${nunito.variable}`}>
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
