import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Payment, CreatePaymentFormValues, PaymentsSummary } from "../types";

import { apiFetch } from "@/lib/api";

export function usePayments(bookingId?: string | null, studentId?: string | null) {
  const queryClient = useQueryClient();

  const {
    data: payments = [],
    isLoading,
    refetch,
  } = useQuery<Payment[]>({
    queryKey: ["payments", bookingId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (bookingId) params.append("bookingId", bookingId);
      if (studentId) params.append("studentId", studentId);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<Payment[]>(`/admin/payments${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for background revalidation
  });

  const { data: summary } = useQuery<PaymentsSummary>({
    queryKey: ["payments-summary"],
    queryFn: async () => {
      return apiFetch<PaymentsSummary>("/admin/payments/summary");
    },
    staleTime: 1000 * 15,
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
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
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
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to delete payment:", e);
      toast.error("Errore nell'eliminazione del pagamento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      status?: string;
      paymentMethod?: string;
      notes?: string;
      amount?: number;
      type?: string;
      studentId?: string;
      bookingId?: string;
      paidAt?: string;
    }) => {
      return apiFetch<Payment>(`/admin/payments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Stato pagamento aggiornato");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
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
    summary,
    loading: isLoading,
    createPayment: createMutation.mutateAsync,
    updatePayment: updateMutation.mutateAsync,
    deletePayment: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}
