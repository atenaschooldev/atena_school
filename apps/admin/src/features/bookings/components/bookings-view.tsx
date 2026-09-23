"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBookings } from "../hooks/use-bookings";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { EditBookingDialog } from "./edit-booking-dialog";
import { CreateBookingDialog } from "./create-booking-dialog";
import { BookingsMetrics } from "./bookings-metrics";
import { getBookingsTableColumns } from "./bookings-table-columns";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
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
import type { Booking } from "../types/booking";
import { useTranslation } from "@/i18n/context";

export function BookingsView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");

  const {
    bookings,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedBooking,
    setSelectedBooking,
    updateBookingStatus,
    deleteBooking,
    createManualBooking,
  } = useBookings();

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (targetId && bookings.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`booking-row-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetId, bookings]);

  const columns = useMemo(
    () =>
      getBookingsTableColumns({
        onViewDetail: (b) => setSelectedBooking(b),
        onEdit: (b) => setEditingBooking(b),
        onDelete: (id) => setDeletingBookingId(id),
        t,
      }),
    [setSelectedBooking, t]
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "completed", label: t("bookings.confirmedBookings") },
    { value: "reserved", label: t("common.reserved") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stat Cards */}
      <BookingsMetrics stats={stats} />

      {/* Toolbar & Main Content */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="purchaser_name"
          searchPlaceholder={t("bookings.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="status"
          filterTitle={t("common.status")}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          actionButton={<CreateBookingDialog onCreateBooking={createManualBooking} />}
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("bookings.emptyState.title") || t("bookings.searchPlaceholder")}
        />
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
        onStatusChange={async (bookingId, newStatus) => {
          await updateBookingStatus({ id: bookingId, status: newStatus });
          if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking({ ...selectedBooking, payment_status: newStatus });
          }
        }}
      />

      <EditBookingDialog
        booking={editingBooking}
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
        onSave={() => {}}
      />

      <DeleteConfirmDialog
        open={!!deletingBookingId}
        onOpenChange={(open) => !open && setDeletingBookingId(null)}
        onConfirm={async () => {
          if (deletingBookingId) {
            await deleteBooking(deletingBookingId);
            setDeletingBookingId(null);
          }
        }}
      />
    </div>
  );
}
