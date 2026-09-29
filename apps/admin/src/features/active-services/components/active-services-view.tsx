"use client";

import { useState, useMemo, useCallback } from "react";
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

  const handleOpenDetail = useCallback(async (item: ActiveServiceItem) => {
    const bookingId = item.booking_id || (item as any).id;
    if (!bookingId) {
      return;
    }

    // 1. Instantly open dialog with available row data so UI responds immediately
    const fallbackBooking: Booking = {
      id: bookingId,
      course_id: item.course_id,
      course_name: item.course_name,
      purchaser_name: item.purchaser_name || item.student_name,
      purchaser_email: item.purchaser_email || item.student_email || "",
      purchaser_phone: item.purchaser_phone,
      purchaser_tax_code: item.purchaser_tax_code,
      student_name: item.student_name,
      student_email: item.student_email,
      student_phone: item.student_phone,
      student_tax_code: item.student_tax_code,
      student_birth_date: item.student_birth_date,
      amount_paid: Number(item.amount_paid || 0),
      registration_fee: Number(item.registration_fee || 0),
      payment_status: item.payment_status ?? 3,
      payment_method: item.payment_method ?? 1,
      billing_scheme: item.billing_scheme ?? 1,
      scheduling_status: item.scheduling_status ?? 1,
      booking_status: item.booking_status ?? 1,
      schedule_days: item.schedule_days,
      start_time: item.start_time,
      end_time: item.end_time,
      start_date: item.start_date,
      total_lessons_count: item.total_lessons_count,
      subscription_starts_at: item.subscription_starts_at,
      subscription_ends_at: item.subscription_ends_at,
      created_at: (item as any).created_at || new Date().toISOString(),
    };

    setSelectedBooking(fallbackBooking);

    // 2. Fetch full backend booking with financial summary in background
    try {
      setLoadingDetail(true);
      const bookingData = await apiFetch<Booking>(`/admin/bookings/${bookingId}`);
      if (bookingData) {
        setSelectedBooking(bookingData);
      }
    } catch (e) {
      console.warn("Using fallback booking data as backend details fetch returned:", e);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const columns = useMemo(
    () =>
      getActiveServicesTableColumns({
        onViewDetail: handleOpenDetail,
        t,
      }),
    [handleOpenDetail, t]
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
