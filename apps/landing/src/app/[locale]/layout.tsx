import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import '@/index.css';
import { Suspense } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isIt = locale === 'it';
  const title = isIt ? 'Atena School — Scuola di Lingua a Cittanova' : 'Atena School — Language School in Cittanova';
  const description = isIt
    ? 'Corsi di inglese, recupero scolastico e preparazione universitaria a Cittanova, Calabria. Lezioni individuali e di gruppo, online e in presenza.'
    : 'English courses, academic tutoring and university preparation in Cittanova, Calabria. Individual and group lessons, online and in-person.';

  return {
    title: {
      default: title,
      template: `%s | Atena School`,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: { it: `${siteUrl}/it`, en: `${siteUrl}/en` },
    },
    openGraph: {
      type: 'website',
      locale: isIt ? 'it_IT' : 'en_US',
      url: `${siteUrl}/${locale}`,
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

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  // Fetch admin role
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = (profile as any)?.role === 'admin';
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
