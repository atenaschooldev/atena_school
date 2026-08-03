import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Payment, CreatePaymentFormValues } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  if (res.status === 204) return {} as T;

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export function usePayments(bookingId?: string | null) {
  const queryClient = useQueryClient();

  const {
    data: payments = [],
    isLoading,
    refetch,
  } = useQuery<Payment[]>({
    queryKey: ["payments", bookingId],
    queryFn: async () => {
      const query = bookingId ? `?bookingId=${bookingId}` : "";
      const data = await apiFetch<Payment[]>(`/admin/payments${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for background revalidation
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreatePaymentFormValues) => {
      return apiFetch<Payment>("/admin/payments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Pagamento registrato con successo");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e) => {
      console.error("Failed to create payment:", e);
      toast.error("Errore nella registrazione del pagamento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/admin/payments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast.success("Pagamento eliminato");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e) => {
      console.error("Failed to delete payment:", e);
      toast.error("Errore nell'eliminazione del pagamento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; paymentMethod?: string; notes?: string }) => {
      return apiFetch<Payment>(`/admin/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Stato pagamento aggiornato");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to update payment:", e);
      toast.error("Errore nell'aggiornamento del pagamento");
    },
  });

  return {
    payments,
    loading: isLoading,
    createPayment: createMutation.mutateAsync,
    updatePayment: updateMutation.mutateAsync,
    deletePayment: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}
