import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BookingOrder } from "../types/booking";
import { apiFetch } from "@/lib/api";

interface BookingStats {
  totalCount: number;
  paidCount: number;
  reservedCount: number;
  leadsCount: number;
}

export function useBookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingOrder | null>(null);

  // Debounced search value — we only send to server after user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  const {
    data: bookings = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<BookingOrder[]>({
    queryKey: ["bookings", debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch<BookingOrder[]>(`/admin/bookings${query}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 30,
  });

  const { data: stats } = useQuery<BookingStats>({
    queryKey: ["bookings-stats"],
    queryFn: () => apiFetch<BookingStats>("/admin/bookings/stats"),
    staleTime: 1000 * 30,
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
      queryClient.invalidateQueries({ queryKey: ["bookings-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookings-stats"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookings-stats"] });
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

  return {
    bookings,
    stats: stats ?? { totalCount: 0, paidCount: 0, reservedCount: 0, leadsCount: 0 },
    loading: isLoading,
    error: queryError instanceof Error ? queryError.message : null,
    searchQuery,
    setSearchQuery: handleSearchChange,
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
