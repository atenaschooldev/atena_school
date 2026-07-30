import { useState, useMemo, useEffect } from "react";
import { type Course, type CourseFormValues, type CourseApiResponse, mapApiToCourse, mapCourseToApiPayload } from "../types";
import { courses as mockCourses } from "@/lib/mock-data";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN =
  import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export function useCourses() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<CourseApiResponse[]>("/courses");
        if (Array.isArray(data)) {
          setAllCourses(data.map(mapApiToCourse));
        } else {
          setAllCourses([]);
        }
      } catch (e) {
        console.error("Failed to fetch courses:", e);
        setError(e instanceof Error ? e.message : "Errore nel caricamento corsi");
        setAllCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleNewClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setEditing(course);
    setOpen(true);
  };

  const handleDeleteClick = async (course: Course) => {
    try {
      await apiFetch<{ success: boolean }>(`/courses/${course.id}`, {
        method: "DELETE",
      });
      setAllCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success("Corso eliminato");
    } catch (e) {
      console.error("Failed to delete course:", e);
      toast.error("Errore nell'eliminazione del corso");
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    for (const id of ids) {
      try {
        await apiFetch<{ success: boolean }>(`/courses/${id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.warn(`Skip delete ${id}:`, e);
      }
    }
    setAllCourses((prev) => prev.filter((c) => !ids.includes(c.id)));
    toast.success("Corsi eliminati");
  };

  const handleFormSubmit = async (formData: CourseFormValues) => {
    const payload = mapCourseToApiPayload(formData);
    try {
      if (editing) {
        const updated = await apiFetch<CourseApiResponse>(`/courses/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        const updatedCourse = mapApiToCourse(updated);
        setAllCourses((prev) =>
          prev.map((c) => (c.id === editing.id ? updatedCourse : c)),
        );
        toast.success("Corso aggiornato");
      } else {
        const created = await apiFetch<CourseApiResponse>("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const newCourse = mapApiToCourse(created);
        setAllCourses((prev) => [...prev, newCourse]);
        toast.success("Corso creato");
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      console.error("Failed to save course:", e);
      toast.error("Errore nel salvataggio del corso");
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const initialFormValues = useMemo<CourseFormValues>(() => {
    if (editing) {
      return {
        nome: editing.nome,
        insegnanteIds: editing.insegnanteIds || (editing.insegnanteId ? [editing.insegnanteId] : []),
        descrizione: editing.descrizione || "",
        foto: editing.foto || "",
        categoria: editing.categoria || "",
        prezzo: editing.prezzo || 0,
        stato: editing.stato || "attivo",
        lessonsPerWeek: editing.lessonsPerWeek ?? null,
        sortOrder: editing.sortOrder ?? 0,
        scheduleType: editing.scheduleType || "fixed",
        totalLessons: editing.totalLessons ?? null,
        scheduleDays: editing.scheduleDays || [],
        startTime: editing.startTime || "",
        endTime: editing.endTime || "",
        lessonDurationMinutes: editing.lessonDurationMinutes ?? null,
        totalHours: editing.totalHours ?? null,
        courseFormat: editing.courseFormat || "group",
        slug: editing.slug || "",
      };
    }
    return {
      nome: "",
      insegnanteIds: [],
      descrizione: "",
      foto: "",
      categoria: "",
      prezzo: 0,
      stato: "attivo",
      lessonsPerWeek: null,
      sortOrder: 0,
      scheduleType: "fixed",
      totalLessons: null,
      scheduleDays: [],
      startTime: "",
      endTime: "",
      lessonDurationMinutes: null,
      totalHours: null,
      courseFormat: "group",
      slug: "",
    };
  }, [editing]);

  return {
    coursesList: allCourses,
    loading,
    error,
    open,
    editing,
    initialFormValues,
    handleNewClick,
    handleEditClick,
    handleDeleteClick,
    handleDeleteSelected,
    handleFormSubmit,
    handleCloseDialog,
  };
}
