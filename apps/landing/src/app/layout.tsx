import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import {
  Navbar,
  Footer,
  GoogleAnalytics,
  ScrollAnimateProvider,
  NavigationProgressBar,
} from '@/components/layout';
import '@/index.css';
import { Nunito } from 'next/font/google';
import type { Viewport } from 'next';

const CookieBanner = dynamic(() => import('@/components/layout/CookieBanner'));
const ScrollToTop = dynamic(() => import('@/components/layout/ScrollToTop'));
const MarketingPopupManager = dynamic(
  () => import('@/components/marketing/MarketingPopupManager').then((m) => m.MarketingPopupManager)
);
const SentryMonitoring = dynamic(
  () => import('@/components/monitoring/SentryMonitoring').then((m) => m.SentryMonitoring)
);
const Toaster = dynamic(() => import('sonner').then((mod) => mod.Toaster));

export const revalidate = 3600;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-nunito',
  adjustFontFallback: true,
});

import { env } from '@/config/env';
import { brandConfig, getEffectiveSchoolProfile } from '@/config/brand.config';
import { getAnalyticsCredentials, getSchoolProfile, getSentryCredentials } from '@atena/core';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const rawSchool = await getSchoolProfile(supabase);
  const school = getEffectiveSchoolProfile(rawSchool);
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


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabaseAdmin();
  const [messages, rawSchool, analytics, sentry] = await Promise.all([
    getMessages(),
    getSchoolProfile(supabase),
    getAnalyticsCredentials(supabase as any).catch(() => ({
      gaId: process.env.NEXT_PUBLIC_GA_ID || '',
      gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
      clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
    })),
    getSentryCredentials(supabase as any).catch(() => ({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '',
    })),
  ]);
  const school = getEffectiveSchoolProfile(rawSchool);

  return (
    <html lang="it" translate="no" suppressHydrationWarning className={`notranslate ${nunito.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta name="google" content="notranslate" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${(school as any)?.primary_color || brandConfig.theme.primary};
                --primary-dark: ${(school as any)?.primary_dark_color || brandConfig.theme.primaryDark};
                --primary-hover: ${(school as any)?.primary_hover_color || brandConfig.theme.primaryHover};
                --secondary: ${(school as any)?.secondary_color || brandConfig.theme.secondary};
                --secondary-hover: ${(school as any)?.secondary_hover_color || brandConfig.theme.secondaryHover};
                --secondary-light: ${(school as any)?.secondary_light_color || brandConfig.theme.secondaryLight};
              }
            `,
          }}
        />
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
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <div className="flex flex-col min-h-screen">
              <Navbar school={school} />
              <main className="flex-grow flex flex-col">{children}</main>
              <Footer school={school} />
              <CookieBanner />
            </div>
            <ScrollToTop />
            <MarketingPopupManager />
            <Toaster position="top-right" richColors />
            <GoogleAnalytics initialAnalytics={analytics} />
            <SentryMonitoring initialDsn={sentry.dsn} />
          </ScrollAnimateProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
