import HeroSection from "@/components/HeroSection";
import AboutSection from "@/features/about/components/AboutSection";
import TestimonialsSection from "@/features/reviews/components/TestimonialsSection";
import ContactSection from "@/features/contact/components/ContactSection";
import TeachersSection from "@/features/teachers/components/TeachersSection";
import { 
  getHeroData, 
  getAboutData, 
  getTestimonials, 
  getContactData, 
  getTeachers 
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
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function IndexPage() {
  // Fetch site content using cached functions
  const [hero, about, testimonials, contact, teachers] = await Promise.all([
    getHeroData(),
    getAboutData(),
    getTestimonials(),
    getContactData(),
    getTeachers()
  ]);

  const siteData = { hero, about, testimonials, contact, teachers };

  return (
    <div className="min-h-screen">
      <HeroSection data={siteData.hero ?? undefined} />
      <AboutSection data={siteData.about ?? undefined} />
      <TeachersSection data={siteData.teachers ?? undefined} />
      <TestimonialsSection data={siteData.testimonials ?? undefined} />
      <ContactSection data={siteData.contact ?? undefined} />
    </div>
  );
}
