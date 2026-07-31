import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Membership } from "../types";

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

export function useMemberships(filters?: { status?: string; academicYear?: string }) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.academicYear && filters.academicYear !== "all")
        params.set("academicYear", filters.academicYear);

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<Membership[]>(`/admin/memberships${query}`);
      setMemberships(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch memberships:", e);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.academicYear]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await apiFetch<Membership>(`/admin/memberships/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMemberships((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success(status === "revoked" ? "Iscrizione revocata" : "Iscrizione riattivata");
      return updated;
    } catch (e) {
      console.error("Failed to update membership status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
      throw e;
    }
  };

  return { memberships, loading, updateStatus, refresh: fetchMemberships };
}
