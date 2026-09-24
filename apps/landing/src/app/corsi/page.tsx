import React from "react";
import { getTranslations } from "next-intl/server";
import CourseSchema from "@/features/courses/components/CourseSchema";
import CoursesCatalog from "@/features/courses/components/CoursesCatalog";
import { getResolvedCourseSections } from "@/features/courses/services/coursesService";
import { env } from "@/config/env";
import { getSchoolProfile } from "@atena/core";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export const revalidate = 3600;

export async function generateMetadata() {
  const supabase = getSupabaseAdmin();
  const school = await getSchoolProfile(supabase);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const title = 'Corsi di Lingua e Formazione';
  const description = `Scopri tutti i corsi di lingua, recupero scolastico e certificazioni di ${school.name} a ${school.city}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/corsi`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: `${siteUrl}/corsi`,
      siteName: school.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CoursesPage() {
  const t = await getTranslations("coursesPage");
  const resolvedSections = await getResolvedCourseSections();

  return (
    <main className="min-h-screen bg-background pt-20 pb-28 relative overflow-hidden">
      {/* Background decorative ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 pb-8 text-center relative z-10" data-gsap="fade-in" suppressHydrationWarning>
        <h1 
          className="text-5xl md:text-7xl font-black uppercase tracking-tight text-foreground mb-6"
        >
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          {t("subtitle")}
        </p>
        <div className="h-1.5 w-32 bg-primary mx-auto mt-8 rounded-full" />
      </header>

      {/* Render Course schemas for SEO */}
      {resolvedSections.map((section) => 
        section.courses.map((course) => (
          <CourseSchema
            key={`schema-${course.id}`}
            name={course.title}
            description={course.description}
            image={typeof course.image === 'string' ? course.image : undefined}
            price={course.price}
          />
        ))
      )}

      {/* Interactive Catalog Component */}
      <CoursesCatalog sections={resolvedSections} />
    </main>
  );
}
