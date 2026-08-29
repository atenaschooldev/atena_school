"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBookings } from "../hooks/use-bookings";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { BookingCard } from "./booking-card";
import { EditBookingDialog } from "./edit-booking-dialog";
import { CreateBookingDialog } from "./create-booking-dialog";
import { BookingsMetrics } from "./bookings-metrics";
import { getBookingsTableColumns } from "./bookings-table-columns";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
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

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

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
      <BookingsMetrics stats={stats} />

      {/* Toolbar & Main Content */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("bookings.searchPlaceholder")}
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("common.status"),
              options: [
                { value: "all", label: t("common.all") },
                { value: "completed", label: t("bookings.confirmedBookings") },
                { value: "reserved", label: t("common.reserved") },
              ],
            },
          ]}
          actionElement={<CreateBookingDialog onCreateBooking={createManualBooking} />}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "table" ? (
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
                    table.getRowModel().rows.map((row) => {
                      const b = row.original;
                      const isTarget = Boolean(
                        targetId &&
                          (b.id === targetId ||
                            b.id.startsWith(targetId) ||
                            targetId.startsWith(b.id) ||
                            (targetId.length >= 6 && b.id.toLowerCase().includes(targetId.toLowerCase())))
                      );
                      return (
                        <TableRow
                          key={row.id}
                          id={`booking-row-${b.id}`}
                          className={`transition-all duration-300 ${
                            isTarget
                              ? "font-bold ring-2 ring-primary/70 shadow-lg"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {row.getVisibleCells().map((cell, idx) => (
                            <TableCell
                              key={cell.id}
                              className={
                                isTarget
                                  ? `bg-primary/20 dark:bg-primary/30 text-foreground font-bold ${
                                      idx === 0 ? "border-l-4 border-l-primary" : ""
                                    }`
                                  : undefined
                              }
                              onClick={(e) => {
                                if (
                                  cell.column.id === "actions" ||
                                  cell.column.id === "select" ||
                                  cell.column.id === "payment_status"
                                ) {
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Nessun ordine trovato.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DataTablePagination table={table} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {bookings.map((booking) => {
              const isTarget = targetId && (booking.id === targetId || booking.id.startsWith(targetId));
              return (
                <div
                  key={booking.id}
                  className={
                    isTarget ? "ring-2 ring-primary ring-offset-2 rounded-xl shadow-lg transition-all duration-300" : ""
                  }
                >
                  <BookingCard
                    booking={booking}
                    onSelect={setSelectedBooking}
                    onDelete={deleteBooking}
                    onToggleStatus={updateBookingStatus}
                  />
                </div>
              );
            })}

            {bookings.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground border rounded-md">
                Nessun ordine trovato.
              </div>
            )}
          </div>
        )}
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={(id, status) => updateBookingStatus(id, status)}
        onDelete={deleteBooking}
      />

      <EditBookingDialog
        booking={editingBooking}
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
        onSuccess={createManualBooking}
      />

      <DeleteConfirmDialog
        open={!!deletingBookingId}
        onOpenChange={(v) => !v && setDeletingBookingId(null)}
        title="Elimina Ordine"
        description="Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata."
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
