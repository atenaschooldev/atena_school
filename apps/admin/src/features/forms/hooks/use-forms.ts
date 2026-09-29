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
  if (filters?.form_type !== undefined) queryParams.set("form_type", String(filters.form_type));
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
    staleTime: 0,
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
    mutationFn: async (vars: any) => {
      const id = vars?.id !== undefined ? String(vars.id) : (vars?.payload?.id !== undefined ? String(vars.payload.id) : (typeof vars === "string" || typeof vars === "number" ? String(vars) : ""));
      const payload = vars?.payload !== undefined ? vars.payload : vars;

      if (!id || id === "undefined" || id === "draft" || id === "new" || id === "null") {
        throw new Error("ID del modulo mancante");
      }

      console.log(`[useForms] PATCH /admin/forms/${id} payload:`, payload);
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
    mutationFn: async (id: string | number) => {
      if (id === undefined || id === null || id === "undefined") throw new Error("ID del modulo mancante");
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
    mutationFn: async (id: string | number) => {
      if (id === undefined || id === null || id === "undefined") throw new Error("ID del modulo mancante");
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
    mutationFn: async (id: string | number) => {
      if (id === undefined || id === null || id === "undefined") throw new Error("ID del modulo mancante");
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
    updateForm: (idOrObj: string | number | { id: string | number; payload: UpdateFormTemplateDto }, maybePayload?: UpdateFormTemplateDto) => {
      if (typeof idOrObj === "string" || typeof idOrObj === "number") {
        return updateMutation.mutateAsync({ id: String(idOrObj), payload: maybePayload! });
      }
      return updateMutation.mutateAsync(idOrObj);
    },
    isUpdating: updateMutation.isPending,
    deleteForm: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultForm: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
    duplicateForm: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
  };
}
