"use client";

import { useState, useMemo } from "react";
import { useActiveServices } from "../hooks/use-active-services";
import { ActiveServicesMetrics } from "./active-services-metrics";
import { getActiveServicesTableColumns } from "./active-services-table-columns";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { BookingDetailDialog } from "@/features/bookings/components/booking-detail-dialog";
import { useBookings } from "@/features/bookings/hooks/use-bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type SortingState,
  flexRender,
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Top Stat Cards */}
      <ActiveServicesMetrics stats={stats} />

      {/* Toolbar & Main Content */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("activeServices.searchPlaceholder") || "Cerca per studente, email, CF o corso..."}
          filters={[
            {
              value: billingFilter,
              onChange: setBillingFilter,
              placeholder: t("common.billingScheme") || "Piano",
              options: [
                { value: "all", label: t("common.all") || "Tutti i piani" },
                { value: "2", label: t("activeServices.subscription") || "Abbonamento Stripe" },
                { value: "1", label: t("activeServices.fullPayment") || "Pagamento Unico" },
              ],
            },
            {
              value: feeStatusFilter,
              onChange: setFeeStatusFilter,
              placeholder: t("activeServices.annualFee") || "Quota Associativa",
              options: [
                { value: "all", label: t("common.all") || "Tutte le quote" },
                { value: "paid", label: t("activeServices.feePaid") || "Quota Regolare" },
                { value: "unpaid", label: t("activeServices.feePending") || "Quota Mancante" },
              ],
            },
          ]}
        />

        <div className="space-y-4">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      {t("activeServices.noServicesFound") || "Nessun servizio attivo trovato."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={async (id, status) => {
          await updateBookingStatus(id, status);
          refetch();
        }}
        onDelete={async (id) => {
          await deleteBooking(id);
          setSelectedBooking(null);
          refetch();
        }}
      />
    </div>
  );
}
