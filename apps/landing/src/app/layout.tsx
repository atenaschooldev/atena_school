import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/it.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import ScrollToTop from '@/components/ScrollToTop';
import '@/index.css';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-nunito',
});

import { env } from '@/config/env';

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const title = 'Atena School — Scuola di Lingua a Cittanova';
  const description = 'Corsi di inglese, recupero scolastico e preparazione universitaria a Cittanova, Calabria. Lezioni individuali e di gruppo, online e in presenza.';

  return {
    title: {
      default: title,
      template: `%s | Atena School`,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
      languages: {
        'it': siteUrl,
        'x-default': siteUrl,
      },
    },
    icons: {
      icon: [
        { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/favicon-32.png',
    },
    manifest: '/site.webmanifest',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: siteUrl,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.webp`, width: 1200, height: 630, alt: 'Atena School' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-default.webp`],
      site: '@atenaschool',
      creator: '@atenaschool',
    },
  };
}

import { Toaster } from 'sonner';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ScrollAnimateProvider from '@/components/ScrollAnimateProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning className={nunito.variable}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale="it" messages={messages as any}>
          <ScrollAnimateProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow flex flex-col">{children}</main>
              <Footer />
              <CookieBanner />
            </div>
            <ScrollToTop />
            <Toaster position="top-right" richColors />
            <GoogleAnalytics />
          </ScrollAnimateProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
