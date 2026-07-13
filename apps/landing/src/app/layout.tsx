import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import messages from '../../messages/it.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import SplashScreen, { SPLASH_COOKIE_NAME } from '@/components/SplashScreen';
import { Playfair_Display } from 'next/font/google';
import '@/index.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';

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
        { url: '/logo-192.png',   sizes: '192x192', type: 'image/png' },
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
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: 'Atena School' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-default.jpg`],
      site: '@atenaschool',
      creator: '@atenaschool',
    },
  };
}

import { Toaster } from 'sonner';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const shouldShowSplash = !cookieStore.has(SPLASH_COOKIE_NAME);

  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
      </head>
      <body className={`${playfair.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider locale="it" messages={messages as any}>
          <SplashScreen initialVisible={shouldShowSplash} />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
            <CookieBanner />
          </div>
          <Toaster position="top-right" richColors />
          <GoogleAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
