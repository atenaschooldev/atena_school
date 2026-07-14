import React from "react";
import { getTranslations } from "next-intl/server";
import { getCourses, getShopItems } from "@/lib/data";
import CourseSchema from "@/features/courses/components/CourseSchema";
import CoursesCatalog from "@/features/courses/components/CoursesCatalog";

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
import imgEipass from "@/assets/eipass.webp";

const localImageMap: Record<string, any> = {
  kids: imgKids,
  starters: imgStarters,
  movers: imgMovers,
  flyers: imgFlyers,
  a2key: imgA2Key,
  a2: imgA2Key,
  b1: imgB1,
  b2: imgB2,
  c1: imgC1,
  doposcuola: imgDoposcuola,
  recovery: imgRecovery,
  university: imgUniversity,
  universi: imgUniversity,
  it_courses: imgIt,
  eipass_user: imgEipass,
  eipass_basic: imgEipass,
  tutor: imgRecovery,
  young: imgMovers,
};

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atenaschool.it';
  const title = 'Corsi di lingua';
  const description = 'Scopri tutti i corsi di inglese, recupero scolastico, preparazione universitaria e certificazioni EIPASS di Atena School a Cittanova.';

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/courses`,
      languages: {
        'it': `${siteUrl}/courses`,
        'x-default': `${siteUrl}/courses`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: `${siteUrl}/courses`,
      siteName: 'Atena School',
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

  // Parallel fetch for courses and shop items from Supabase
  const [supabaseCourses, shopItems] = await Promise.all([
    getCourses(),
    getShopItems()
  ]);

  const hasDbCourses = supabaseCourses && supabaseCourses.length > 0;
  let courseSections: Array<{ id: string; title: string; courses?: any[]; items?: string[] }> = [];

  if (hasDbCourses && supabaseCourses) {
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
    courseSections = [
      {
        id: 'language',
        title: t("sections.language"),
        items: ['kids', 'starters', 'movers', 'flyers', 'a2key', 'b1', 'b2', 'c1']
      },
      {
        id: 'academic',
        title: t("sections.academic"),
        items: ['doposcuola', 'recovery', 'university']
      },
      {
        id: 'certipass',
        title: t("sections.certipass"),
        items: ['eipass_user', 'eipass_basic']
      }
    ];
  }

  // Append hourly private lesson packages from shop_items
  if (shopItems && shopItems.length > 0) {
    courseSections.push({
      id: 'packages',
      title: 'Lezioni Private e Pacchetti',
      courses: shopItems.map((item: any) => ({
        ...item,
        name: item.title_it,
        description: `Durata: ${item.duration_it || 'Flessibile'}. Scegli il pacchetto di lezioni individuali o di gruppo con orari flessibili.`,
        type: 'shop'
      }))
    });
  }

  // Resolve all sections into clean structures
  const resolvedSections = courseSections.map((section) => {
    let resolvedCourses: any[] = [];

    if (section.courses) {
      resolvedCourses = section.courses.map((course: any) => {
        const itemTitle = course.title_it || course.name;
        const itemDesc = course.description_it || course.description || "";
        const itemPrice = course.price ? `${course.price}€` : undefined;

        const lowerName = (course.name || "").toLowerCase();
        let itemImage = course.photo_url || undefined;
        if (!itemImage) {
          const matchedKey = Object.keys(localImageMap).find(key => {
            const cleanKey = key.replace('_', '');
            const cleanName = lowerName.replace(/\s+/g, '').replace('-', '');
            return cleanName.includes(cleanKey);
          });
          if (matchedKey) {
            itemImage = localImageMap[matchedKey];
          } else if (lowerName.includes('eipass') || lowerName.includes('certipass')) {
            itemImage = imgEipass;
          } else {
            itemImage = imgIt;
          }
        }

        return {
          id: course.id,
          title: itemTitle,
          description: itemDesc,
          image: itemImage,
          price: itemPrice,
          type: course.type || 'course'
        };
      });
    } else if (section.items) {
      resolvedCourses = section.items.map((itemKey) => {
        const match = supabaseCourses?.find(sc => sc.slug === itemKey);
        const itemTitle = match?.title_it || t(`items.${itemKey}.title`);
        const itemDesc = match?.description_it || t(`items.${itemKey}.description`);
        const itemPrice = match?.price_eur ? `${match.price_eur}€` : undefined;

        return {
          id: match?.id || itemKey,
          title: itemTitle,
          description: itemDesc,
          image: match?.image_url || localImageMap[itemKey],
          price: itemPrice,
          type: 'course'
        };
      });
    }

    return {
      id: section.id,
      title: section.title,
      courses: resolvedCourses
    };
  });

  return (
    <main className="min-h-screen bg-background pt-24 pb-28 relative overflow-hidden">
      {/* Background decorative ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 pt-16 pb-8 text-center relative z-10">
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
