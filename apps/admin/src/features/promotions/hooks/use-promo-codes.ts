import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PromoCodeItem, CreatePromoCodeInput } from "../types";
import { apiFetch } from "@/lib/api";

export function usePromoCodes(filters?: { search?: string; status?: string }) {
  const queryClient = useQueryClient();
  const search = filters?.search;
  const status = filters?.status;

  const {
    data: promoCodes = [],
    isLoading,
    refetch,
  } = useQuery<PromoCodeItem[]>({
    queryKey: ["promo-codes", search, status],
    queryFn: async () => {
      const data = await apiFetch<PromoCodeItem[]>("/admin/promo-codes");
      let list = Array.isArray(data) ? data : [];

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.code.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
      }

      if (status === "active") {
        list = list.filter((p) => p.is_active);
      } else if (status === "inactive") {
        list = list.filter((p) => !p.is_active);
      }

      return list;
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreatePromoCodeInput) => {
      return apiFetch<PromoCodeItem>("/admin/promo-codes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (created) => {
      toast.success(`Codice promo "${created.code}" creato con successo`);
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la creazione del codice promo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreatePromoCodeInput> }) => {
      return apiFetch<PromoCodeItem>(`/admin/promo-codes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Codice promo aggiornato");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'aggiornamento");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<PromoCodeItem>(`/admin/promo-codes/${id}/toggle`, {
        method: "PATCH",
      });
    },
    onSuccess: (updated) => {
      toast.success(`Stato codice ${updated.code} aggiornato (${updated.is_active ? "Attivo" : "Disattivato"})`);
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la modifica dello stato");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/promo-codes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Codice promo eliminato");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'eliminazione");
    },
  });

  return {
    promoCodes,
    loading: isLoading,
    createPromoCode: createMutation.mutateAsync,
    updatePromoCode: (id: string, payload: Partial<CreatePromoCodeInput>) =>
      updateMutation.mutateAsync({ id, payload }),
    togglePromoCode: (id: string) => toggleStatusMutation.mutateAsync(id),
    deletePromoCode: (id: string) => deleteMutation.mutateAsync(id),
    refresh: refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
