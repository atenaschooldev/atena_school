import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  NotificationTriggerRecord,
  CreateNotificationTriggerDto,
  UpdateNotificationTriggerDto,
  SystemEventDefinition,
} from "@atena/api-types";

export function useNotificationTriggers() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // 1. Fetch triggers
  const {
    data: triggers = [],
    isLoading: loadingTriggers,
    refetch: refetchTriggers,
  } = useQuery<NotificationTriggerRecord[]>({
    queryKey: ["notification-triggers"],
    queryFn: async () => {
      const data = await apiFetch<NotificationTriggerRecord[]>("/admin/notifications/triggers");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 20,
  });

  // 2. Fetch system events schema
  const {
    data: systemEvents = {},
    isLoading: loadingEvents,
  } = useQuery<Record<string, SystemEventDefinition>>({
    queryKey: ["notification-system-events"],
    queryFn: async () => {
      const data = await apiFetch<Record<string, SystemEventDefinition>>("/admin/notifications/system-events");
      return data || {};
    },
    staleTime: 1000 * 60 * 10,
  });

  // 3. Create Trigger Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: CreateNotificationTriggerDto) => {
      return apiFetch<NotificationTriggerRecord>("/admin/notifications/triggers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("notifications.triggerCreated") || "Regola creata con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.saveError") || "Errore durante la creazione");
    },
  });

  // 4. Update Trigger Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateNotificationTriggerDto }) => {
      return apiFetch<NotificationTriggerRecord>(`/admin/notifications/triggers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("notifications.triggerUpdated") || "Regola aggiornata con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.saveError") || "Errore durante l'aggiornamento");
    },
  });

  // 5. Toggle Trigger Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiFetch<NotificationTriggerRecord>(`/admin/notifications/triggers/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore cambio stato");
    },
  });

  // 6. Delete Trigger Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/notifications/triggers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.info(t("notifications.triggerDeleted") || "Regola eliminata");
      queryClient.invalidateQueries({ queryKey: ["notification-triggers"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Errore eliminazione");
    },
  });

  return {
    triggers,
    systemEvents,
    loading: loadingTriggers || loadingEvents,
    refresh: refetchTriggers,
    createTrigger: (payload: CreateNotificationTriggerDto) => createMutation.mutateAsync(payload),
    updateTrigger: (id: string, payload: UpdateNotificationTriggerDto) =>
      updateMutation.mutateAsync({ id, payload }),
    toggleTrigger: (id: string, isActive: boolean) =>
      toggleMutation.mutateAsync({ id, isActive }),
    deleteTrigger: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
