import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Membership } from "../types";

import { apiFetch } from "@/lib/api";

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
