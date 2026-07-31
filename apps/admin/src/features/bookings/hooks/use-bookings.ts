import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { BookingOrder } from "../types/booking";

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

export function useBookings() {
  const [allBookings, setAllBookings] = useState<BookingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<BookingOrder[]>("/admin/bookings");
      setAllBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
      setError(e instanceof Error ? e.message : "Errore nel caricamento prenotazioni");
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = useCallback(
    async (id: string, payment_status: string, scheduling_status?: string) => {
      try {
        const updated = await apiFetch<BookingOrder>(`/admin/bookings/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ payment_status, scheduling_status }),
        });
        setAllBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
        if (selectedBooking?.id === id) {
          setSelectedBooking(updated);
        }
        toast.success("Stato prenotazione aggiornato");
      } catch (e) {
        console.error("Failed to update status:", e);
        toast.error("Errore nell'aggiornamento dello stato");
      }
    },
    [selectedBooking],
  );

  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await apiFetch(`/admin/bookings/${id}`, { method: "DELETE" });
        setAllBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBooking?.id === id) {
          setSelectedBooking(null);
        }
        toast.success("Prenotazione eliminata");
        return true;
      } catch (e) {
        console.error("Failed to delete booking:", e);
        toast.error("Errore nell'eliminazione della prenotazione");
        return false;
      }
    },
    [selectedBooking],
  );

  const createManualBooking = useCallback(async (data: any) => {
    try {
      const created = await apiFetch<BookingOrder>("/admin/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setAllBookings((prev) => [created, ...prev]);
      toast.success("Prenotazione registrata con successo");
      return created;
    } catch (e) {
      console.error("Failed to create manual booking:", e);
      toast.error("Errore nella registrazione della prenotazione");
      throw e;
    }
  }, []);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchPurchaser = (b.purchaser_name || "").toLowerCase().includes(q);
        const matchStudent = (b.student_name || "").toLowerCase().includes(q);
        const matchEmail = (b.purchaser_email || "").toLowerCase().includes(q);
        const matchCourse = (b.course_name || "").toLowerCase().includes(q);
        if (!matchPurchaser && !matchStudent && !matchEmail && !matchCourse) return false;
      }

      if (statusFilter !== "all" && b.payment_status !== statusFilter) return false;

      return true;
    });
  }, [allBookings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      totalCount: allBookings.length,
      paidCount: allBookings.filter((b) => b.payment_status === "completed" || b.payment_status === "paid").length,
      reservedCount: allBookings.filter((b) => b.payment_status === "reserved").length,
      leadsCount: allBookings.filter((b) => b.scheduling_status === "pending_coordination").length,
    };
  }, [allBookings]);

  return {
    bookings: filteredBookings,
    allBookings,
    stats,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedBooking,
    setSelectedBooking,
    updateBookingStatus,
    deleteBooking,
    createManualBooking,
    refresh: fetchBookings,
  };
}
