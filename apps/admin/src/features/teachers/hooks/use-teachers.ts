import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Teacher, UpdateTeacherFormValues } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

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

  if (res.status === 204) return {} as T;

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

function parseTeacher(raw: any): Teacher {
  const fullName = raw.fullName || raw.full_name || "Docente";
  const nameParts = fullName.trim().split(" ");
  const nome = nameParts[0] || "Docente";
  const cognome = nameParts.slice(1).join(" ") || "";

  return {
    id: raw.teacherId || raw.id,
    teacherId: raw.teacherId || raw.id,
    fullName,
    nome,
    cognome,
    email: raw.email || null,
    telefono: raw.phone || raw.telefono || null,
    photoUrl: raw.photoUrl || raw.photo_url || null,
    status: raw.status || "active",
    experience: raw.experience || null,
    hireDate: raw.hireDate || raw.hire_date || null,
    birthDate: raw.birthDate || raw.birth_date || null,
    lessonCount: raw.lessonCount ?? 0,
    courseCount: raw.courseCount ?? 0,
  };
}

export function useTeachers() {
  const queryClient = useQueryClient();

  const {
    data: teachers = [],
    isLoading,
    refetch,
  } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/admin/teachers");
      return Array.isArray(data) ? data.map(parseTeacher) : [];
    },
    staleTime: 1000 * 30, // 30s stale time
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (values: { fullName: string; status?: string; experience?: string; photoUrl?: string }) => {
      const created = await apiFetch<any>("/admin/teachers", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return parseTeacher(created);
    },
    onSuccess: () => {
      toast.success("Nuovo docente aggiunto");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => {
      console.error("Failed to create teacher:", e);
      toast.error("Errore nella creazione del docente");
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateTeacherFormValues }) => {
      const updated = await apiFetch<any>(`/admin/teachers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      return parseTeacher(updated);
    },
    onSuccess: () => {
      toast.success("Profilo docente aggiornato");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => {
      console.error("Failed to update teacher:", e);
      toast.error("Errore nell'aggiornamento del docente");
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<any>(`/admin/teachers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Docente eliminato");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => {
      console.error("Failed to delete teacher:", e);
      toast.error("Errore nell'eliminazione del docente");
    },
  });

  const createTeacher = async (values: { fullName: string; status?: string; experience?: string; photoUrl?: string }) => {
    return createTeacherMutation.mutateAsync(values);
  };

  const updateTeacher = async (id: string, values: UpdateTeacherFormValues) => {
    return updateTeacherMutation.mutateAsync({ id, values });
  };

  const deleteTeacher = async (id: string) => {
    return deleteTeacherMutation.mutateAsync(id);
  };

  return {
    teachers,
    loading: isLoading,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    refresh: refetch,
  };
}
