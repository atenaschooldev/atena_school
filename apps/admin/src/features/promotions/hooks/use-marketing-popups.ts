import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MarketingPopupItem, CreateMarketingPopupInput } from "@atena/api-types";
import { apiFetch } from "@/lib/api";

export function useMarketingPopups() {
  const queryClient = useQueryClient();

  const {
    data: popups = [],
    isLoading,
    refetch,
  } = useQuery<MarketingPopupItem[]>({
    queryKey: ["marketing-popups"],
    queryFn: async () => {
      const data = await apiFetch<MarketingPopupItem[]>("/admin/marketing-popups");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateMarketingPopupInput) => {
      return apiFetch<MarketingPopupItem>("/admin/marketing-popups", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (created) => {
      toast.success(`Popup "${created.title}" creato con successo`);
      queryClient.invalidateQueries({ queryKey: ["marketing-popups"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la creazione del popup");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateMarketingPopupInput> }) => {
      return apiFetch<MarketingPopupItem>(`/admin/marketing-popups/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Popup aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["marketing-popups"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'aggiornamento del popup");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<MarketingPopupItem>(`/admin/marketing-popups/${id}/toggle`, {
        method: "PATCH",
      });
    },
    onSuccess: (updated) => {
      toast.success(`Stato popup "${updated.title}" aggiornato (${updated.is_active ? "Attivo" : "Disattivato"})`);
      queryClient.invalidateQueries({ queryKey: ["marketing-popups"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la modifica dello stato");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/marketing-popups/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Popup eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["marketing-popups"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'eliminazione");
    },
  });

  const uploadImage = async (dataUrl: string, fileName?: string): Promise<string> => {
    const res = await apiFetch<{ success?: boolean; url: string }>("/admin/marketing-popups/upload-image", {
      method: "POST",
      body: JSON.stringify({ dataUrl, fileName }),
    });
    return res.url;
  };

  return {
    popups,
    loading: isLoading,
    createPopup: createMutation.mutateAsync,
    updatePopup: (id: string, payload: Partial<CreateMarketingPopupInput>) =>
      updateMutation.mutateAsync({ id, payload }),
    togglePopup: (id: string) => toggleStatusMutation.mutateAsync(id),
    deletePopup: (id: string) => deleteMutation.mutateAsync(id),
    uploadImage,
    refresh: refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
