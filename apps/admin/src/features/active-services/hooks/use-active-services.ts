import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActiveServiceItem, ActiveServicesStats } from "../types/active-service";
import { apiFetch } from "@/lib/api";

interface ActiveServicesResponse {
  items: ActiveServiceItem[];
  total: number;
  stats: ActiveServicesStats;
}

export function useActiveServices() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [billingFilter, setBillingFilter] = useState<string>("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<ActiveServiceItem | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ActiveServicesResponse>({
    queryKey: ["active-services", debouncedSearch, categoryFilter, billingFilter, feeStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (billingFilter !== "all") params.set("billingScheme", billingFilter);
      if (feeStatusFilter !== "all") {
        params.set("studentAnnualFeePaid", feeStatusFilter === "paid" ? "true" : "false");
      }
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiFetch<ActiveServicesResponse>(`/admin/active-services${query}`);
      return res || { items: [], total: 0, stats: { totalActive: 0, activeSubscriptions: 0, totalCompletedLessons: 0, totalRemainingLessons: 0, unpaidAnnualFeeCount: 0 } };
    },
    staleTime: 1000 * 30,
  });

  return {
    activeServices: data?.items || [],
    total: data?.total || 0,
    stats: data?.stats || {
      totalActive: 0,
      activeSubscriptions: 0,
      totalCompletedLessons: 0,
      totalRemainingLessons: 0,
      unpaidAnnualFeeCount: 0,
    },
    loading: isLoading,
    queryError,
    searchQuery,
    setSearchQuery: handleSearchChange,
    categoryFilter,
    setCategoryFilter,
    billingFilter,
    setBillingFilter,
    feeStatusFilter,
    setFeeStatusFilter,
    selectedService,
    setSelectedService,
    refetch,
  };
}
