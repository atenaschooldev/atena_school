import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const status = filters?.status;
  const academicYear = filters?.academicYear;

  const {
    data: memberships = [],
    isLoading,
    refetch,
  } = useQuery<Membership[]>({
    queryKey: ["memberships", status, academicYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (academicYear && academicYear !== "all") params.set("academicYear", academicYear);

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<Membership[]>(`/admin/memberships${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms cached rendering
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiFetch<Membership>(`/admin/memberships/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, { status }) => {
      toast.success(status === "revoked" ? "Iscrizione revocata" : "Iscrizione riattivata");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to update membership status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
    },
  });

  const updateStatus = async (id: string, status: string) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  return { memberships, loading: isLoading, updateStatus, refresh: refetch };
}
