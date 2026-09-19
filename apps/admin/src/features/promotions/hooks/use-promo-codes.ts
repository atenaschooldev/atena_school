import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PromoCodeItem, CreatePromoCodeInput } from "../types";
import { apiFetch } from "@/lib/api";

export function usePromoCodes() {
  const queryClient = useQueryClient();

  const {
    data: promoCodes = [],
    isLoading,
    refetch,
  } = useQuery<PromoCodeItem[]>({
    queryKey: ["promo-codes"],
    queryFn: async () => {
      const data = await apiFetch<PromoCodeItem[]>("/admin/promo-codes");
      return Array.isArray(data) ? data : [];
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
