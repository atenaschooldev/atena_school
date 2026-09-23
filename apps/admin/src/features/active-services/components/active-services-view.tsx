"use client";

import { useState, useMemo } from "react";
import { useActiveServices } from "../hooks/use-active-services";
import { ActiveServicesMetrics } from "./active-services-metrics";
import { getActiveServicesTableColumns } from "./active-services-table-columns";
import { BookingDetailDialog } from "@/features/bookings/components/booking-detail-dialog";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ActiveServiceItem } from "../types/active-service";
import type { Booking } from "@/features/bookings/types/booking";
import { useTranslation } from "@/i18n/context";
import { apiFetch } from "@/lib/api";

export function ActiveServicesView() {
  const { t } = useTranslation();

  const {
    activeServices,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    billingFilter,
    setBillingFilter,
    feeStatusFilter,
    setFeeStatusFilter,
    refetch,
  } = useActiveServices();

  const { updateBookingStatus, deleteBooking } = useBookings();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "course_name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const handleOpenDetail = async (item: ActiveServiceItem) => {
    try {
      setLoadingDetail(true);
      const bookingData = await apiFetch<Booking>(`/admin/bookings/${item.booking_id}`);
      if (bookingData) {
        setSelectedBooking(bookingData);
      }
    } catch (e) {
      console.error("Failed to load booking details:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const columns = useMemo(
    () =>
      getActiveServicesTableColumns({
        onViewDetail: handleOpenDetail,
        t,
      }),
    [t]
  );

  const table = useReactTable({
    data: activeServices,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const billingOptions = [
    { value: "all", label: t("common.all") || "Tutti i piani" },
    { value: "2", label: t("activeServices.subscription") || "Abbonamento Stripe" },
    { value: "1", label: t("activeServices.fullPayment") || "Pagamento Unico" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stat Cards */}
      <ActiveServicesMetrics stats={stats} />

      {/* Toolbar & Main Content */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="student_name"
          searchPlaceholder={t("activeServices.searchPlaceholder") || "Cerca per studente, email, CF o corso..."}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="billing_scheme"
          filterTitle={t("common.billingScheme") || "Piano"}
          filterValue={billingFilter}
          onFilterChange={setBillingFilter}
          filterOptions={billingOptions}
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("activeServices.emptyState.title") || t("activeServices.searchPlaceholder")}
        />
      </div>

      {selectedBooking && (
        <BookingDetailDialog
          booking={selectedBooking}
          open={!!selectedBooking}
          onOpenChange={(open) => !open && setSelectedBooking(null)}
          onStatusChange={async (bookingId, newStatus) => {
            await updateBookingStatus({ id: bookingId, status: newStatus });
            refetch();
          }}
        />
      )}
    </div>
  );
}
