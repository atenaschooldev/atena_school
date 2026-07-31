import { useState, useEffect, useCallback } from "react";
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/admin/teachers");
      setTeachers(Array.isArray(data) ? data.map(parseTeacher) : []);
    } catch (e) {
      console.error("Failed to fetch teachers:", e);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const updateTeacher = async (id: string, values: UpdateTeacherFormValues) => {
    try {
      const updated = await apiFetch<any>(`/admin/teachers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      const parsed = parseTeacher(updated);
      setTeachers((prev) => prev.map((t) => (t.id === id ? parsed : t)));
      toast.success("Profilo docente aggiornato");
      return parsed;
    } catch (e) {
      console.error("Failed to update teacher:", e);
      toast.error("Errore nell'aggiornamento del docente");
      throw e;
    }
  };

  return { teachers, loading, updateTeacher, refresh: fetchTeachers };
}
