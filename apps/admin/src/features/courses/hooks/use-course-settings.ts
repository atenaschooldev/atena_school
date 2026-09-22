import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  CourseSettingsRecord,
  CreateCourseSettingsDto,
  UpdateCourseSettingsDto,
} from "../types";

export function useCourseSettings() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    data: settings = [],
    isLoading,
    refetch,
  } = useQuery<CourseSettingsRecord[]>({
    queryKey: ["course-settings"],
    queryFn: async () => {
      const data = await apiFetch<CourseSettingsRecord[]>("/admin/courses/settings");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateCourseSettingsDto) => {
      return apiFetch<CourseSettingsRecord>("/admin/courses/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("courses.settingsCreateSuccess") || "Preset di configurazione creato con successo");
      queryClient.invalidateQueries({ queryKey: ["course-settings"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.settingsCreateError") || "Errore durante la creazione del preset");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCourseSettingsDto }) => {
      return apiFetch<CourseSettingsRecord>(`/admin/courses/settings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("courses.settingsUpdateSuccess") || "Configurazione salvata con successo");
      queryClient.invalidateQueries({ queryKey: ["course-settings"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.settingsUpdateError") || "Errore durante il salvataggio");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/courses/settings/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("courses.settingsDeleteSuccess") || "Preset eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["course-settings"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("courses.settingsDeleteError") || "Errore durante l'eliminazione del preset");
    },
  });

  return {
    settings,
    loading: isLoading,
    refresh: refetch,
    createSettings: (payload: CreateCourseSettingsDto) => createMutation.mutateAsync(payload),
    updateSettings: (id: string, payload: UpdateCourseSettingsDto) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteSettings: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
