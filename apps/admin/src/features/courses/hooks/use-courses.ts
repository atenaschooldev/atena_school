import { useState, useMemo, useEffect } from "react";
import { type Course, type CourseFormValues, type CourseApiResponse, mapApiToCourse, mapCourseToApiPayload } from "../types";
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

  return res.json();
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
        setAllCourses(Array.isArray(data) ? data.map(mapApiToCourse) : []);
      } catch (e) {
        console.error("Failed to fetch courses:", e);
        setError(e instanceof Error ? e.message : "Errore nel caricamento corsi");
        setAllCourses([]);
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
        livello: editing.livello || "A1",
        insegnanteIds: editing.insegnanteIds || [editing.insegnanteId].filter(Boolean) as string[],
        moduli: editing.moduli || 8,
        capienza: editing.capienza || 10,
        colore: editing.colore || "chart-1",
        descrizione: editing.descrizione || "",
        foto: editing.foto || "",
        categoria: editing.categoria || "General English",
        durata: editing.durata || "60 ore",
        prezzo: editing.prezzo || 0,
        stato: editing.stato || "attivo",
      };
    }
    return {
      nome: "",
      livello: "A1",
      insegnanteIds: [],
      moduli: 8,
      capienza: 15,
      colore: "chart-1",
      descrizione: "",
      foto: "",
      categoria: "General English",
      durata: "60 ore",
      prezzo: 0,
      stato: "attivo",
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
