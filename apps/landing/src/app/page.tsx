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

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
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
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: 'Atena School' }],
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
      <HeroSection data={siteData.hero ?? undefined} />
      <StatsSection />
      <AboutSection data={siteData.about ?? undefined} />
      <TestimonialsSection data={siteData.testimonials ?? undefined} />
      <CtaBanner />
    </div>
  );
}
