import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/features/about/components/AboutSection";
import TestimonialsSection from "@/features/reviews/components/TestimonialsSection";
import CtaBanner from "@/components/CtaBanner";
import {
  getHeroData,
  getAboutData,
  getTestimonials
} from "@/lib/data";

import { env } from "@/config/env";

export async function generateMetadata() {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = 'Atena School — Scuola di Lingua a Cittanova';
  const description = 'Corsi di inglese, recupero scolastico e preparazione universitaria a Cittanova, Calabria. Prenota la tua lezione oggi.';

  return {
    title,
    description,
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
      site: '@atenaschool',
      creator: '@atenaschool',
    },
  };
}

export default async function IndexPage() {
  // Fetch site content using cached functions
  const [hero, about, testimonials] = await Promise.all([
    getHeroData(),
    getAboutData(),
    getTestimonials()
  ]);

  const siteData = { hero, about, testimonials };

  return (
    <div className="min-h-screen">
      <div data-aos="fade-in"><HeroSection data={siteData.hero ?? undefined} /></div>
      <div data-aos="fade-up"><StatsSection /></div>
      <AboutSection data={siteData.about ?? undefined} />
      <TestimonialsSection data={siteData.testimonials ?? undefined} />
      <div data-aos="fade-up"><CtaBanner /></div>
    </div>
  );
}
