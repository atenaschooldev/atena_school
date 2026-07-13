import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/it.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import '@/index.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';

export async function generateMetadata() {
  const title = 'Atena School — Corsi di Lingua e Recupero Scolastico a Cittanova';
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
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale="it" messages={messages as any}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
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
