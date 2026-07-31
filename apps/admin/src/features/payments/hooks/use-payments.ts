import { useState, useEffect, useCallback } from "react";
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

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export function usePayments(bookingId?: string | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const query = bookingId ? `?bookingId=${bookingId}` : "";
      const data = await apiFetch<Payment[]>(`/admin/payments${query}`);
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch payments:", e);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = async (data: CreatePaymentFormValues) => {
    try {
      const created = await apiFetch<Payment>("/admin/payments", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setPayments((prev) => [created, ...prev]);
      toast.success("Pagamento registrato con successo");
      return created;
    } catch (e) {
      console.error("Failed to create payment:", e);
      toast.error("Errore nella registrazione del pagamento");
      throw e;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await apiFetch(`/admin/payments/${id}`, { method: "DELETE" });
      setPayments((prev) => prev.filter((p) => p.id !== id));
      toast.success("Pagamento eliminato");
    } catch (e) {
      console.error("Failed to delete payment:", e);
      toast.error("Errore nell'eliminazione del pagamento");
    }
  };

  return {
    payments,
    loading,
    createPayment,
    deletePayment,
    refresh: fetchPayments,
  };
}
