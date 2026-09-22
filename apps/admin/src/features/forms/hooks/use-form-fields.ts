import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  FormFieldItem,
  CreateFormFieldDto,
  UpdateFormFieldDto,
} from "../types";

export function useFormFields(filter?: { target?: string; is_system?: boolean }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const queryKey = ["form-fields", filter?.target, filter?.is_system];

  const {
    data: fields = [],
    isLoading,
    refetch,
  } = useQuery<FormFieldItem[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.target) params.set("target", filter.target);
      if (typeof filter?.is_system === "boolean") params.set("is_system", String(filter.is_system));
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<FormFieldItem[]>(`/admin/forms/fields${queryString}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateFormFieldDto) => {
      return apiFetch<FormFieldItem>("/admin/forms/fields", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.createSuccess") || "Campo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.createError") || "Errore durante la creazione del campo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateFormFieldDto }) => {
      return apiFetch<FormFieldItem>(`/admin/forms/fields/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.updateSuccess") || "Campo aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.updateError") || "Errore durante l'aggiornamento del campo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean; id: string }>(`/admin/forms/fields/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("forms.fields.deleteSuccess") || "Campo eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["form-fields"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("forms.fields.deleteError") || "Errore durante l'eliminazione del campo");
    },
  });

  return {
    fields,
    isLoading,
    refetch,
    createField: (payload: CreateFormFieldDto) => createMutation.mutateAsync(payload),
    updateField: (id: string, payload: UpdateFormFieldDto) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteField: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
