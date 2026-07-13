import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/it.json';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import '@/index.css';
import { Suspense } from 'react';

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
    },
  };
}

import { Toaster } from 'sonner';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { createClient } from '@/lib/supabase/server';
import { AdminProvider } from '@/features/admin/components/AdminProvider';
import { GlobalEditManager } from '@/features/admin/components/GlobalEditManager';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch admin role
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = (profile as any)?.role === 'admin';
  }

  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale="it" messages={messages}>
          <AdminProvider isAdmin={isAdmin}>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <CookieBanner />
            </div>
            <Suspense fallback={null}>
              <GlobalEditManager />
            </Suspense>
            <Toaster position="top-right" richColors />
            <GoogleAnalytics />
          </AdminProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
