import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import {
  type FormTemplate,
  FormType,
  type CreateFormTemplateDto,
  type UpdateFormTemplateDto,
} from "../types";
import {
  DEFAULT_BOOKING_FORM_TEMPLATE,
  DEFAULT_CONTACT_FORM_TEMPLATE,
} from "@atena/core";

const BUILTIN_FALLBACKS: FormTemplate[] = [
  DEFAULT_BOOKING_FORM_TEMPLATE,
  DEFAULT_CONTACT_FORM_TEMPLATE,
];

export function useForms(filters?: {
  form_type?: FormType;
  is_active?: boolean;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const queryParams = new URLSearchParams();
  if (filters?.form_type) queryParams.set("form_type", filters.form_type);
  if (filters?.is_active !== undefined) queryParams.set("is_active", String(filters.is_active));

  const queryString = queryParams.toString();
  const endpoint = `/admin/forms${queryString ? `?${queryString}` : ""}`;

  const {
    data: forms = BUILTIN_FALLBACKS,
    isLoading,
    refetch,
  } = useQuery<FormTemplate[]>({
    queryKey: ["admin-forms", filters?.form_type, filters?.is_active],
    queryFn: async () => {
      try {
        const data = await apiFetch<FormTemplate[]>(endpoint);
        return Array.isArray(data) && data.length > 0 ? data : BUILTIN_FALLBACKS;
      } catch (e) {
        return BUILTIN_FALLBACKS;
      }
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateFormTemplateDto) => {
      return apiFetch<FormTemplate>("/admin/forms", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Nuovo modello di modulo creato con successo");
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la creazione del modulo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateFormTemplateDto }) => {
      return apiFetch<FormTemplate>(`/admin/forms/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success("Modulo aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'aggiornamento del modulo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean; id: string }>(`/admin/forms/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("Modulo eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante l'eliminazione del modulo");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<FormTemplate>(`/admin/forms/${id}/set-default`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Modulo impostato come predefinito");
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore impostazione modulo predefinito");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<FormTemplate>(`/admin/forms/${id}/duplicate`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Modulo duplicato con successo");
      queryClient.invalidateQueries({ queryKey: ["admin-forms"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore durante la duplicazione del modulo");
    },
  });

  return {
    forms,
    isLoading,
    refetch,
    createForm: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateForm: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteForm: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultForm: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
    duplicateForm: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
  };
}
