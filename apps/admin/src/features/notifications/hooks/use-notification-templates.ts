import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import type {
  NotificationTemplateRecord,
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateNotificationTemplateDto }) => {
      return apiFetch<NotificationTemplateRecord>(`/admin/notifications/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (updated) => {
      toast.success(t("notifications.saveSuccess") || "Template salvato con successo");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || t("notifications.saveError") || "Errore durante il salvataggio");
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
    updateTemplate: (id: string, payload: UpdateNotificationTemplateDto) =>
      updateMutation.mutateAsync({ id, payload }),
    testSend: (id: string, payload: TestSendNotificationDto) =>
      testSendMutation.mutateAsync({ id, payload }),
    isUpdating: updateMutation.isPending,
    isTesting: testSendMutation.isPending,
  };
}
