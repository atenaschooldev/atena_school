import { getTranslations } from "next-intl/server";
import { getCourses } from "@/lib/data";



export interface ResolvedCourse {
  id: string;
  title: string;
  description: string;
  image: any;
  price?: string;
  type: string;
  teacher_name?: string;
  lessons_per_week?: number | null;
  lesson_duration_minutes?: number | null;
  total_hours?: number | null;
  total_lessons?: number | null;
  course_format?: string | null;
  schedule_days?: number[] | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface ResolvedSection {
  id: string;
  title: string;
  courses: ResolvedCourse[];
}

export async function getResolvedCourseSections(): Promise<ResolvedSection[]> {
  const t = await getTranslations("coursesPage");

  // Fetch courses from Supabase
  const supabaseCourses = await getCourses();

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

      const itemImage = course.photo_url || undefined;

      return {
        id: course.id,
        title: itemTitle,
        description: itemDesc,
        image: itemImage,
        price: itemPrice,
        type: course.type || 'course',
        teacher_name: course.teacher_name || undefined,
        lessons_per_week: course.lessons_per_week !== undefined ? course.lessons_per_week : null,
        lesson_duration_minutes: course.lesson_duration_minutes || null,
        total_hours: course.total_hours || null,
        total_lessons: course.total_lessons || null,
        course_format: course.course_format || null,
        schedule_days: course.schedule_days || null,
        start_time: course.start_time || null,
        end_time: course.end_time || null,
        sort_order: typeof course.sort_order === 'number' ? course.sort_order : 0
      };
    });

    resolvedCourses.sort((a, b) => {
      const orderA = a.sort_order || 0;
      const orderB = b.sort_order || 0;

      if (orderA === orderB) {
        return a.title.localeCompare(b.title);
      }
      if (orderA === 0) return 1;
      if (orderB === 0) return -1;

      return orderA - orderB;
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

