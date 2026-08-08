import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Payment, CreatePaymentFormValues, PaymentsSummary } from "../types";

import { apiFetch } from "@/lib/api";

export interface PaymentsFilters {
  bookingId?: string | null;
  studentId?: string | null;
  status?: string;
  type?: string;
  method?: string;
  search?: string;
}

export function usePayments(
  bookingIdOrFilters?: string | null | PaymentsFilters,
  studentIdParam?: string | null,
) {
  const queryClient = useQueryClient();

  let bookingId: string | undefined;
  let studentId: string | undefined;
  let status: string | undefined;
  let type: string | undefined;
  let method: string | undefined;
  let search: string | undefined;

  if (bookingIdOrFilters && typeof bookingIdOrFilters === "object") {
    bookingId = bookingIdOrFilters.bookingId || undefined;
    studentId = bookingIdOrFilters.studentId || undefined;
    status = bookingIdOrFilters.status || undefined;
    type = bookingIdOrFilters.type || undefined;
    method = bookingIdOrFilters.method || undefined;
    search = bookingIdOrFilters.search || undefined;
  } else {
    bookingId = bookingIdOrFilters || undefined;
    studentId = studentIdParam || undefined;
  }

  const {
    data: payments = [],
    isLoading,
    refetch,
  } = useQuery<Payment[]>({
    queryKey: ["payments", bookingId, studentId, status, type, method, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (bookingId) params.append("bookingId", bookingId);
      if (studentId) params.append("studentId", studentId);
      if (status && status !== "all") params.append("status", status);
      if (type && type !== "all") params.append("type", type);
      if (method && method !== "all") params.append("method", method);
      if (search && search.trim()) params.append("search", search.trim());

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<Payment[]>(`/admin/payments${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
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
