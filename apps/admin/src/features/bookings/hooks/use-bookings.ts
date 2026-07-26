import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookingOrder } from "../types/booking";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

// В dev среде используем тестовый токен (AuthGuard пропускает его с role=admin).
// В production сюда должен подставляться реальный JWT админа.
const ADMIN_TOKEN =
  import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

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

  return res.json();
}

export function useBookings() {
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "reserved" | "leads" | "child">("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<BookingOrder[]>("/admin/bookings");
        setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch bookings:", e);
        setError(e instanceof Error ? e.message : "Errore nel caricamento prenotazioni");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName =
        b.purchaser_name.toLowerCase().includes(q) ||
        b.student_name.toLowerCase().includes(q);
      const matchEmail =
        (b.purchaser_email || "").toLowerCase().includes(q) ||
        (b.student_email || "").toLowerCase().includes(q);
      const matchCourse = (b.course_name || "").toLowerCase().includes(q);
      const matchTax =
        (b.purchaser_tax_code || "").toLowerCase().includes(q) ||
        (b.student_tax_code || "").toLowerCase().includes(q);
      const matchId = (b.id || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCourse && !matchTax && !matchId) return false;
    }

    if (activeTab === "paid") return b.payment_status === "paid";
    if (activeTab === "reserved") return b.payment_status === "reserved";
    if (activeTab === "leads") return b.scheduling_status === "pending_coordination";
    if (activeTab === "child") return !!(b.is_for_child || b.purchaser_name !== b.student_name);

    return true;
  });

  const totalCount = bookings.length;
  const paidCount = bookings.filter((b) => b.payment_status === "paid").length;
  const reservedCount = bookings.filter((b) => b.payment_status === "reserved").length;
  const leadsCount = bookings.filter((b) => b.scheduling_status === "pending_coordination").length;
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.amount_paid || 0), 0);

  const updateBookingStatus = async (
    id: string,
    newPaymentStatus: "paid" | "reserved" | "pending_payment",
    newScheduleStatus?: "scheduled" | "pending_coordination" | "confirmed"
  ) => {
    try {
      const updated = await apiFetch<BookingOrder>(`/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          payment_status: newPaymentStatus,
          ...(newScheduleStatus ? { scheduling_status: newScheduleStatus } : {}),
        }),
      });

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === id) {
            if (selectedBooking?.id === id) setSelectedBooking(updated);
            return updated;
          }
          return b;
        })
      );
      toast.success("Stato aggiornato");
    } catch (e) {
      console.error("Failed to update booking status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await apiFetch<{ success: boolean }>(`/admin/bookings/${id}`, {
        method: "DELETE",
      });

      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (selectedBooking?.id === id) setSelectedBooking(null);
      toast.success("Prenotazione eliminata");
      return true;
    } catch (e) {
      console.error("Failed to delete booking:", e);
      toast.error("Errore nell'eliminazione della prenotazione");
      return false;
    }
  };

  return {
    bookings: filteredBookings,
    allBookings: bookings,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedBooking,
    setSelectedBooking,
    stats: { totalCount, paidCount, reservedCount, leadsCount, totalRevenue },
    updateBookingStatus,
    deleteBooking,
  };
}
