import { HeroSection, StatsSection, getHomePageData } from "@/features/home";
import { AboutSection } from "@/features/about";
import { TestimonialsSection } from "@/features/reviews";
import { ContactSection } from "@/features/contact";
import { env } from "@/config/env";
import { getSchoolProfile, resolveActiveFormTemplate } from "@atena/core";
import { FormType } from "@atena/api-types";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = `${school.name} — Scuola di Lingue e Formazione a ${school.city}`;
  const description = `Corsi di lingua, recupero scolastico e preparazione esami a ${school.city} (${school.province}). Prenota la tua lezione oggi.`;

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
      siteName: school.name,
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.webp`, width: 1200, height: 630, alt: school.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function IndexPage() {
  const supabase = getSupabaseAdmin();
  const [school, homeData, templatesResult] = await Promise.all([
    getSchoolProfile(supabase),
    getHomePageData(),
    Promise.resolve(
      supabase
        .from('form_templates')
        .select('*')
        .eq('is_active', true)
    ).catch(() => ({ data: [] })),
  ]);

  const contactTemplate = resolveActiveFormTemplate(templatesResult?.data || [], {
    form_type: FormType.CONTACT,
  });

  const { hero, about, testimonials, contact } = homeData;

  return (
    <div className="min-h-screen">
      <HeroSection data={hero} school={school} />
      <StatsSection />
      <AboutSection data={about} school={school} />
      <TestimonialsSection data={testimonials} school={school} />
      <ContactSection
        data={contact}
        school={school}
        initialFormTemplate={contactTemplate}
      />
    </div>
  );
}
