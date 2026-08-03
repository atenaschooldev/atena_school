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

  const updateTeacher = async (id: string, values: UpdateTeacherFormValues) => {
    return updateTeacherMutation.mutateAsync({ id, values });
  };

  return { teachers, loading: isLoading, updateTeacher, refresh: refetch };
}
