import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { BookingOrder } from "../types/booking";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "DEVELOPMENT_TEST_TOKEN";

const DEFAULT_MOCK_BOOKINGS: BookingOrder[] = [
  {
    id: "b1",
    code: "ATN-2026-001",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: new Date().toISOString(),
    amountTotal: 450,
    amountPaid: 450,
    student: {
      id: "s1",
      firstName: "Marco",
      lastName: "Rossi",
      email: "marco.rossi@example.it",
      phone: "+39 340 1234567",
      type: "ADULT",
    },
    course: {
      id: "c1",
      title: "English B2 Upper-Intermediate",
      category: "Adulti",
      format: "Presenza",
    },
    paymentMethod: "Stripe Card",
  },
  {
    id: "b2",
    code: "ATN-2026-002",
    status: "PENDING",
    paymentStatus: "PARTIAL",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    amountTotal: 620,
    amountPaid: 200,
    student: {
      id: "s2",
      firstName: "Giulia",
      lastName: "Bianchi",
      email: "giulia.b@example.it",
      phone: "+39 333 9876543",
      type: "JUNIOR",
    },
    course: {
      id: "c2",
      title: "Kids English A1 Fun",
      category: "Bambini",
      format: "Presenza",
    },
    paymentMethod: "Bonifico Bancario",
  },
];

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
  const [bookings, setBookings] = useState<BookingOrder[]>(DEFAULT_MOCK_BOOKINGS);
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
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
        } else {
          setBookings(DEFAULT_MOCK_BOOKINGS);
        }
      } catch (e) {
        console.error("Failed to fetch bookings:", e);
        setError(e instanceof Error ? e.message : "Errore nel caricamento prenotazioni");
        setBookings(DEFAULT_MOCK_BOOKINGS);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = `${b.student?.firstName || ""} ${b.student?.lastName || ""}`
        .toLowerCase()
        .includes(q);
      const matchCode = (b.code || "").toLowerCase().includes(q);
      const matchCourse = (b.course?.title || "").toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCourse) return false;
    }

    if (activeTab === "paid" && b.paymentStatus !== "PAID") return false;
    if (activeTab === "reserved" && b.status !== "PENDING") return false;
    if (activeTab === "leads" && b.status !== "LEAD") return false;
    if (activeTab === "child" && b.student?.type !== "JUNIOR") return false;

    return true;
  });

  const stats = {
    totalCount: bookings.length,
    paidCount: bookings.filter((b) => b.paymentStatus === "PAID" || (b as any).payment_status === "paid").length,
    reservedCount: bookings.filter((b) => b.status === "PENDING" || (b as any).payment_status === "reserved").length,
    leadsCount: bookings.filter((b) => b.status === "LEAD").length,
  };

  return {
    bookings: filteredBookings,
    allBookings: bookings,
    stats,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedBooking,
    setSelectedBooking,
  };
}
