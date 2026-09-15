import { useState, useMemo } from "react";

export interface CleanCourse {
  id: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  price?: string;
  type: "course" | "shop" | string;
  teacher_name?: string;
  lessons_per_week?: number | null;
  lesson_duration_minutes?: number | null;
  total_hours?: number | null;
  total_lessons?: number | null;
  course_format?: string | number | null;
  schedule_days?: number[] | string[] | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface CleanSection {
  id: string;
  title: string;
  courses: CleanCourse[];
}

export function useCoursesCatalog(sections: CleanSection[]) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabs = useMemo(() => {
    return [
      { id: "all", title: "Tutti i corsi" },
      ...sections.map((s) => ({ id: s.id, title: s.title })),
    ];
  }, [sections]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return sections
      .map((section) => {
        if (activeTab !== "all" && section.id !== activeTab) {
          return null;
        }

        const matchedCourses = section.courses.filter((course) => {
          if (!query) return true;
          return (
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
          );
        });

        if (matchedCourses.length === 0) {
          return null;
        }

        return {
          ...section,
          courses: matchedCourses,
        };
      })
      .filter((s): s is CleanSection => s !== null);
  }, [sections, activeTab, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabs,
    filteredSections,
  };
}
