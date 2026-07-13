import React from "react";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import CoursesHero from "@/features/courses/components/CoursesHero";
import CourseCard from "@/features/courses/components/CourseCard";
import { getCourses } from "@/lib/data";
import CourseSchema from "@/features/courses/components/CourseSchema";

// Local asset imports
import imgKids from "@/assets/course-kids.jpg";
import imgStarters from "@/assets/course-starters.jpeg";
import imgMovers from "@/assets/course-movers.jpeg";
import imgFlyers from "@/assets/course-flyers.jpeg";
import imgA2Key from "@/assets/course-a2key.jpeg";
import imgB1 from "@/assets/course-b1.jpeg";
import imgB2 from "@/assets/course-b2.jpeg";
import imgC1 from "@/assets/course-c1.jpeg";
import imgDoposcuola from "@/assets/course-doposcuola.jpg";
import imgRecovery from "@/assets/course-recovery.jpeg";
import imgUniversity from "@/assets/course-university.jpg";
import imgIt from "@/assets/course-it_courses.jpg";

const localImageMap: Record<string, any> = {
  kids: imgKids,
  starters: imgStarters,
  movers: imgMovers,
  flyers: imgFlyers,
  a2key: imgA2Key,
  b1: imgB1,
  b2: imgB2,
  c1: imgC1,
  doposcuola: imgDoposcuola,
  recovery: imgRecovery,
  university: imgUniversity,
  it_courses: imgIt,
  eipass_user: imgIt,
  eipass_basic: imgIt,
};

export async function generateStaticParams() {
  return [{ locale: "it" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const isIt = locale === 'it';
  const title = isIt ? 'Corsi di lingua' : 'Language Courses';
  const description = isIt
    ? 'Scopri tutti i corsi di inglese, recupero scolastico, preparazione universitaria e certificazioni EIPASS di Atena School a Cittanova.'
    : 'Explore all English courses, academic tutoring, university preparation, and EIPASS certifications at Atena School in Cittanova.';
  const url = `${siteUrl}/${locale}/courses`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'it': `${siteUrl}/it/courses`,
        'en': `${siteUrl}/en/courses`,
        'x-default': `${siteUrl}/it/courses`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isIt ? 'it_IT' : 'en_US',
      url,
      siteName: 'Atena School',
      title,
      description,
      images: [{ url: `${siteUrl}/og-default.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CoursesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("coursesPage");

  const supabaseCourses = await getCourses();

  // If we have courses in the database, group and show them dynamically.
  // Otherwise, fallback to the pre-existing translation-based static showcase.
  const hasDbCourses = supabaseCourses && supabaseCourses.length > 0;

  let courseSections: Array<{ id: string; title: string; courses?: any[]; items?: string[] }> = [];

  if (hasDbCourses) {
    const categoriesMap: Record<string, any[]> = {};
    supabaseCourses.forEach((course) => {
      const cat = course.category || "Other";
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = [];
      }
      categoriesMap[cat].push(course);
    });

    courseSections = Object.entries(categoriesMap).map(([catName, courses]) => {
      let sectionTitle = catName;
      const lowerCat = catName.toLowerCase();
      if (lowerCat === "languages" || lowerCat === "language") {
        sectionTitle = t("sections.language");
      } else if (lowerCat === "academic" || lowerCat === "recupero") {
        sectionTitle = t("sections.academic");
      } else if (lowerCat === "certipass" || lowerCat === "eipass") {
        sectionTitle = t("sections.certipass");
      }
      return {
        id: catName,
        title: sectionTitle,
        courses
      };
    });
  } else {
    // Fallback to static translated items
    courseSections = [
      {
        id: "language",
        title: t("sections.language"),
        items: ["kids", "starters", "movers", "flyers", "a2key", "b1", "b2", "c1"]
      },
      {
        id: "certipass",
        title: t("sections.certipass"),
        items: ["eipass_user", "eipass_basic"]
      },
      {
        id: "academic",
        title: t("sections.academic"),
        items: ["doposcuola", "recovery", "university", "it_courses"]
      }
    ];
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Visual glowing decorative backdrops */}
      <div className="glow-orb w-[500px] h-[500px] bg-primary/10 top-1/4 -right-20" />
      <div className="glow-orb w-[600px] h-[600px] bg-secondary/15 bottom-1/3 -left-30" />

      <CoursesHero />

      <section className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        {courseSections.map((section) => (
          <div key={section.id} className="mb-28 last:mb-0">
            <div className="flex items-center gap-6 mb-12">
              <h2 
                className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {section.title}
              </h2>
              <div className="h-[2px] flex-grow bg-gradient-to-r from-primary/60 via-secondary/40 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hasDbCourses && section.courses ? (
                section.courses.map((course: any) => {
                  const itemTitle = locale === "it" ? (course.title_it || course.name) : (course.title_en || course.name);
                  const itemDesc = locale === "it" ? (course.description_it || course.description || "") : (course.description_en || course.description || "");
                  const itemPrice = course.price ? `${course.price}€` : undefined;

                  const lowerName = (course.name || "").toLowerCase();
                  let itemImage = course.photo_url || undefined;
                  if (!itemImage) {
                    const matchedKey = Object.keys(localImageMap).find(key => {
                      const cleanKey = key.replace('_', '');
                      const cleanName = lowerName.replace(/\s+/g, '').replace('-', '');
                      return cleanName.includes(cleanKey) || cleanName.includes('eipass') || cleanName.includes('certipass');
                    });
                    if (matchedKey) {
                      itemImage = localImageMap[matchedKey];
                    } else {
                      // Fallback to general IT courses image
                      itemImage = imgIt;
                    }
                  }

                  return (
                    <React.Fragment key={course.id}>
                      <CourseSchema
                        name={itemTitle}
                        description={itemDesc}
                        image={typeof itemImage === 'string' ? itemImage : undefined}
                        price={itemPrice}
                      />
                      <CourseCard
                        id={course.id}
                        title={itemTitle}
                        description={itemDesc}
                        image={itemImage}
                        category={section.title}
                        price={itemPrice}
                      />
                    </React.Fragment>
                  );
                })
              ) : (
                section.items?.map((itemKey) => {
                  // Try to find matching supabase course by slug
                  const match = supabaseCourses?.find(sc => sc.slug === itemKey);
                  const itemTitle = match?.[`title_${locale}`] || t(`items.${itemKey}.title`);
                  const itemDesc = match?.[`description_${locale}`] || t(`items.${itemKey}.description`);
                  const itemPrice = match?.price_eur ? `${match.price_eur}€` : undefined;

                  return (
                    <React.Fragment key={itemKey}>
                      <CourseSchema
                        name={itemTitle}
                        description={itemDesc}
                        image={match?.image_url}
                        price={itemPrice}
                      />
                      <CourseCard
                        id={match?.id}
                        title={itemTitle}
                        description={itemDesc}
                        image={match?.image_url || localImageMap[itemKey]}
                        category={section.title}
                        price={itemPrice}
                      />
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
