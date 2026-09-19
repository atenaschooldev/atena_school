import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import {
  Navbar,
  Footer,
  CookieBanner,
  ScrollToTop,
  GoogleAnalytics,
  ScrollAnimateProvider,
} from '@/components/layout';
import '@/index.css';
import { Nunito } from 'next/font/google';
import type { Viewport } from 'next';

export const revalidate = 60;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-nunito',
});

import { env } from '@/config/env';
import { getSchoolProfile } from '@atena/core';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const title = `${school.name} — Scuola di Lingue e Formazione a ${school.city}`;
  const description = `Corsi di lingua, recupero scolastico e certificazioni a ${school.city} (${school.province}). Lezioni individuali e di gruppo, online e in presenza.`;

  return {
    title: {
      default: title,
      template: `%s | ${school.name}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
      languages: {
        'it-IT': siteUrl,
      },
    },
    other: {
      google: 'notranslate',
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
      siteName: school.name,
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.webp`, width: 1200, height: 630, alt: school.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-default.webp`],
    },
  };
}

import { Toaster } from 'sonner';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);

  return (
    <html lang="it" translate="no" suppressHydrationWarning className={`notranslate ${nunito.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": school.name,
              "legalName": school.legal_name,
              "url": siteUrl,
              "logo": `${siteUrl}/logo-192.png`,
              "image": `${siteUrl}/og-default.webp`,
              "description": `Corsi di lingua, recupero scolastico e certificazioni a ${school.city} (${school.province}).`,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": school.address,
                "addressLocality": school.city,
                "addressRegion": school.province,
                "postalCode": school.cap,
                "addressCountry": "IT",
              },
              "telephone": [school.phone, school.landline].filter(Boolean),
              "email": school.secretariat_email || school.email,
              "priceRange": "€€",
              "sameAs": Object.values(school.socials || {}).filter(Boolean),
            }).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale="it" messages={messages}>
          <ScrollAnimateProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar school={school} />
              <main className="flex-grow flex flex-col">{children}</main>
              <Footer school={school} />
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
