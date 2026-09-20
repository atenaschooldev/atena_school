import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  NotificationTemplateRecord,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  TestSendNotificationDto,
} from "../types";

export function useNotificationTemplates(filters?: {
  channel?: number;
  recipient_type?: number;
  search?: string;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const queryParams = new URLSearchParams();
  if (filters?.channel) queryParams.set("channel", String(filters.channel));
  if (filters?.recipient_type) queryParams.set("recipient_type", String(filters.recipient_type));
  if (filters?.search) queryParams.set("search", filters.search);

  const queryString = queryParams.toString();
  const endpoint = `/admin/notifications/templates${queryString ? `?${queryString}` : ""}`;

  const {
    data: templates = [],
    isLoading,
    refetch,
  } = useQuery<NotificationTemplateRecord[]>({
    queryKey: ["notification-templates", filters?.channel, filters?.recipient_type, filters?.search],
    queryFn: async () => {
      const data = await apiFetch<NotificationTemplateRecord[]>(endpoint);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateNotificationTemplateDto) => {
      return apiFetch<NotificationTemplateRecord>("/admin/notifications/templates", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("notifications.createSuccess") || "Nuovo template creato con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.createError") || "Errore durante la creazione del template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateNotificationTemplateDto }) => {
      return apiFetch<NotificationTemplateRecord>(`/admin/notifications/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      toast.success(t("notifications.saveSuccess") || "Template salvato con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.saveError") || "Errore durante il salvataggio");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean }>(`/admin/notifications/templates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success(t("notifications.deleteSuccess") || "Template eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.deleteError") || "Errore durante l'eliminazione del template");
    },
  });

  const testSendMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: TestSendNotificationDto }) => {
      return apiFetch<{ success: boolean; message: string; details?: any }>(
        `/admin/notifications/templates/${id}/test-send`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
    },
    onSuccess: (res) => {
      toast.success(res?.message || t("notifications.testSuccess") || "Notifica di test inviata!");
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.testError") || "Errore invio notifica di test");
    },
  });

  return {
    templates,
    loading: isLoading,
    refresh: refetch,
    createTemplate: (payload: CreateNotificationTemplateDto) =>
      createMutation.mutateAsync(payload),
    updateTemplate: (id: string, payload: UpdateNotificationTemplateDto) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteTemplate: (id: string) =>
      deleteMutation.mutateAsync(id),
    testSend: (id: string, payload: TestSendNotificationDto) =>
      testSendMutation.mutateAsync({ id, payload }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testSendMutation.isPending,
  };
}

export interface NotificationLogsResponse {
  data: Array<{
    id: string;
    created_at: string;
    channel: number;
    notification_type: number;
    recipient: string;
    subject?: string;
    request: any;
    response?: any;
    status: number;
  }>;
  total: number;
  page: number;
  limit: number;
}

export function useNotificationLogs(filters?: {
  page?: number;
  limit?: number;
  channel?: number;
  status?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.set("page", String(filters.page));
  if (filters?.limit) queryParams.set("limit", String(filters.limit));
  if (filters?.channel) queryParams.set("channel", String(filters.channel));
  if (filters?.status) queryParams.set("status", String(filters.status));
  if (filters?.search) queryParams.set("search", filters.search);

  const queryString = queryParams.toString();
  const endpoint = `/admin/notifications/logs${queryString ? `?${queryString}` : ""}`;

  const {
    data,
    isLoading,
    refetch,
  } = useQuery<NotificationLogsResponse>({
    queryKey: ["notification-logs", filters?.page, filters?.limit, filters?.channel, filters?.status, filters?.search],
    queryFn: async () => {
      const res = await apiFetch<NotificationLogsResponse>(endpoint);
      return res || { data: [], total: 0, page: 1, limit: 20 };
    },
    staleTime: 1000 * 15,
  });

  return {
    logs: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading: isLoading,
    refresh: refetch,
  };
}
