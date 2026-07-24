import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/features/about/components/AboutSection";
import TestimonialsSection from "@/features/reviews/components/TestimonialsSection";
import CtaBanner from "@/components/CtaBanner";
import ContactSection from "@/features/contact/components/ContactSection";
import { getHomePageData } from "@/features/home/services/homeService";
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
  const { hero, about, testimonials, contact } = await getHomePageData();

  return (
    <div className="min-h-screen">
      <HeroSection data={hero} />
      <StatsSection />
      <AboutSection data={about} />
      <TestimonialsSection data={testimonials} />
      <div className="space-y-0">
        <div data-gsap="fade-up" data-gsap-delay="0">
          <CtaBanner />
        </div>
        <div data-gsap="fade-up" data-gsap-delay="200">
          <ContactSection data={contact} />
        </div>
      </div>
    </div>
  );
}
