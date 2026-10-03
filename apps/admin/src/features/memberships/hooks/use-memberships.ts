import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Membership } from "../types";

import { apiFetch } from "@/lib/api";

export interface MembershipStats {
  total: number;
  active: number;
  pending: number;
  expiredOrRevoked: number;
}

export function useMemberships(filters?: { status?: string; academicYear?: string; search?: string }) {
  const queryClient = useQueryClient();

  const status = filters?.status;
  const academicYear = filters?.academicYear;
  const search = filters?.search;

  const {
    data: memberships = [],
    isLoading,
    refetch,
  } = useQuery<Membership[]>({
    queryKey: ["memberships", status, academicYear, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (academicYear && academicYear !== "all") params.set("academicYear", academicYear);
      if (search && search.trim()) params.set("search", search.trim());

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<Membership[]>(`/admin/memberships${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const { data: stats } = useQuery<MembershipStats>({
    queryKey: ["memberships-stats"],
    queryFn: () => apiFetch<MembershipStats>("/admin/memberships/stats"),
    staleTime: 1000 * 30,
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
      queryClient.invalidateQueries({ queryKey: ["memberships-stats"] });
    },
    onError: (e) => {
      console.error("Failed to update membership status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
    },
  });

  // Toggle status is determined by the backend — no need to pass current status
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<Membership>(`/admin/memberships/${id}/toggle-status`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      toast.success("Stato tessera aggiornato");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships-stats"] });
    },
    onError: (e) => {
      console.error("Failed to toggle membership status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
    },
  });

  // Delete membership
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean; id: string }>(`/admin/memberships/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Quota associativa eliminata con successo");
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["memberships-stats"] });
    },
    onError: (e) => {
      console.error("Failed to delete membership:", e);
      toast.error("Errore nell'eliminazione della quota associativa");
    },
  });

  const updateStatus = async (id: string, status: string) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  const toggleStatus = async (id: string) => {
    return toggleStatusMutation.mutateAsync(id);
  };

  const deleteMembership = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    memberships,
    stats: stats ?? { total: 0, active: 0, pending: 0, expiredOrRevoked: 0 },
    loading: isLoading,
    updateStatus,
    toggleStatus,
    deleteMembership,
    refresh: refetch,
  };
}
