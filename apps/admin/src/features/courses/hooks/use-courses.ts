import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Course, type CourseFormValues, type CourseApiResponse, mapApiToCourse, mapCourseToApiPayload } from "../types";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

export function useCourses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const {
    data: allCourses = [],
    isLoading,
    error: queryError,
  } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const data = await apiFetch<CourseApiResponse[]>("/courses");
      return Array.isArray(data) ? data.map(mapApiToCourse) : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms render
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/courses/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Corso eliminato");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e) => {
      console.error("Failed to delete course:", e);
      toast.error("Errore nell'eliminazione del corso");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ payload, editId }: { payload: any; editId?: string }) => {
      if (editId) {
        const updated = await apiFetch<CourseApiResponse>(`/courses/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        return mapApiToCourse(updated);
      } else {
        const created = await apiFetch<CourseApiResponse>("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return mapApiToCourse(created);
      }
    },
    onSuccess: (_, { editId }) => {
      toast.success(editId ? "Corso aggiornato" : "Corso creato");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setOpen(false);
      setEditing(null);
    },
    onError: (e) => {
      console.error("Failed to save course:", e);
      toast.error("Errore nel salvataggio del corso");
    },
  });

  const handleNewClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setEditing(course);
    setOpen(true);
  };

  const handleDeleteClick = async (course: Course) => {
    await deleteMutation.mutateAsync(course.id);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (e) {
        console.warn(`Skip delete ${id}:`, e);
      }
    }
  };

  const handleFormSubmit = async (formData: CourseFormValues) => {
    const payload = mapCourseToApiPayload(formData);
    await saveMutation.mutateAsync({ payload, editId: editing?.id });
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
    loading: isLoading,
    error: queryError instanceof Error ? queryError.message : null,
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
