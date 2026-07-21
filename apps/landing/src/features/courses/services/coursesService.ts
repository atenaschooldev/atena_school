import { getTranslations } from "next-intl/server";
import { getCourses, getShopItems } from "@/lib/data";

// Local asset imports
import imgDoposcuola from "@/assets/course-doposcuola.jpg";
import imgRecovery from "@/assets/course-recovery.jpeg";
import imgUniversity from "@/assets/course-university.jpg";
import imgIt from "@/assets/course-it_courses.jpg";
import imgEipass from "@/assets/eipass.webp";

const localImageMap: Record<string, any> = {
  doposcuola: imgDoposcuola,
  recovery: imgRecovery,
  university: imgUniversity,
  universi: imgUniversity,
  it_courses: imgIt,
  eipass_user: imgEipass,
  eipass_basic: imgEipass,
  tutor: imgRecovery,
};

export interface ResolvedCourse {
  id: string;
  title: string;
  description: string;
  image: any;
  price?: string;
  type: string;
  duration?: string;
  teacher_name?: string;
  standard_schedule?: string;
}

export interface ResolvedSection {
  id: string;
  title: string;
  courses: ResolvedCourse[];
}

export async function getResolvedCourseSections(): Promise<ResolvedSection[]> {
  const t = await getTranslations("coursesPage");

  // Parallel fetch for courses and shop items from Supabase
  const [supabaseCourses, shopItems] = await Promise.all([
    getCourses(),
    getShopItems()
  ]);

  let courseSections: Array<{ id: string; title: string; courses: any[] }> = [];

  if (supabaseCourses && supabaseCourses.length > 0) {
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
    const resolvedCourses = section.courses.map((course: any) => {
      const itemTitle = course.title_it || course.name;
      const itemDesc = course.description_it || course.description || "";
      let itemPrice: string | undefined = undefined;
      if (course.price !== undefined && course.price !== null) {
        const priceNum = typeof course.price === 'number' ? course.price : parseFloat(course.price.toString());
        if (!isNaN(priceNum) && priceNum > 0) {
          itemPrice = `${priceNum.toFixed(2)}€`;
        }
      }

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
        type: course.type || 'course',
        duration: course.duration || course.duration_it || undefined,
        teacher_name: course.teacher_name || undefined,
        standard_schedule: course.standard_schedule || undefined
      };
    });

    return {
      id: section.id,
      title: section.title,
      courses: resolvedCourses
    };
  });

  // Sort sections: place "Corsi di lingua" (languages) first
  const langIndex = resolvedSections.findIndex(
    (s) => s.id.toLowerCase() === "languages" || s.id.toLowerCase() === "language"
  );
  if (langIndex > 0) {
    const [langSection] = resolvedSections.splice(langIndex, 1);
    resolvedSections.unshift(langSection);
  }

  return resolvedSections;
}

