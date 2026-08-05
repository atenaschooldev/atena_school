import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BookingOrder } from "../types/booking";
import { apiFetch } from "@/lib/api";

export function useBookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);

  const {
    data: allBookings = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<BookingOrder[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const data = await apiFetch<BookingOrder[]>("/admin/bookings");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30, // 30s stale time for instant 0ms cached render
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      payment_status,
      scheduling_status,
    }: {
      id: string;
      payment_status: string;
      scheduling_status?: string;
    }) => {
      return apiFetch<BookingOrder>(`/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status, scheduling_status }),
      });
    },
    onSuccess: (updated, { id }) => {
      toast.success("Stato prenotazione aggiornato");
      if (selectedBooking?.id === id) {
        setSelectedBooking(updated);
      }
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to update status:", e);
      toast.error("Errore nell'aggiornamento dello stato");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/admin/bookings/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, id) => {
      toast.success("Prenotazione eliminata");
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to delete booking:", e);
      toast.error("Errore nell'eliminazione della prenotazione");
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiFetch<BookingOrder>("/admin/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Prenotazione registrata con successo");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
    onError: (e) => {
      console.error("Failed to create manual booking:", e);
      toast.error("Errore nella registrazione della prenotazione");
    },
  });

  const updateBookingStatus = useCallback(
    async (id: string, payment_status: string, scheduling_status?: string) => {
      await updateStatusMutation.mutateAsync({ id, payment_status, scheduling_status });
    },
    [updateStatusMutation],
  );

  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation],
  );

  const createManualBooking = useCallback(
    async (data: any) => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

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
      paidCount: allBookings.filter((b) => b.payment_status === "completed" || b.payment_status === "paid" || b.payment_status === "succeeded").length,
      reservedCount: allBookings.filter((b) => b.payment_status === "reserved").length,
      leadsCount: allBookings.filter((b) => b.scheduling_status === "pending_coordination").length,
    };
  }, [allBookings]);

  return {
    bookings: filteredBookings,
    allBookings,
    stats,
    loading: isLoading,
    error: queryError instanceof Error ? queryError.message : null,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedBooking,
    setSelectedBooking,
    updateBookingStatus,
    deleteBooking,
    createManualBooking,
    refresh: refetch,
  };
}
