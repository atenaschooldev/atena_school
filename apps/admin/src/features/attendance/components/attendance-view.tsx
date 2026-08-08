"use client";

import { useState, useMemo } from "react";
import { useAttendance } from "../hooks/use-attendance";
import { QuickLessonPaymentDialog } from "./quick-lesson-payment-dialog";
import { BookingDetailDialog } from "@/features/bookings/components/booking-detail-dialog";
import { AttendanceMetrics } from "./attendance-metrics";
import { getAttendanceTableColumns } from "./attendance-table-columns";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
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
import type { LessonAttendanceItem } from "../types";
import type { Booking } from "@/features/bookings/types";

export function AttendanceView() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [quickPayItem, setQuickPayItem] = useState<LessonAttendanceItem | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    lessons,
    loading,
    searchQuery,
    setSearchQuery,
    markAttendance,
  } = useAttendance(selectedDate);

  const handleDateChange = (offsetDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleMarkAttendance = async (item: LessonAttendanceItem, status: string) => {
    await markAttendance(item.id, status);
    if (
      (status === "present" || status === "late") &&
      ((item as any).requires_payment_on_attendance ?? (item.payment_status !== "paid" || item.billing_scheme === "per_lesson"))
    ) {
      setQuickPayItem(item);
    }
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchStudent = (item.student_name || "").toLowerCase().includes(q);
        const matchCourse = (item.course_name || "").toLowerCase().includes(q);
        const matchTeacher = (item.teacher_name || "").toLowerCase().includes(q);
        if (!matchStudent && !matchCourse && !matchTeacher) return false;
      }
      if (courseFilter !== "all" && item.course_name !== courseFilter) return false;
      return true;
    });
  }, [lessons, searchQuery, courseFilter]);

  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach((l) => {
      if (l.course_name) set.add(l.course_name);
    });
    return Array.from(set);
  }, [lessons]);

  const totalCount = filteredLessons.length;
  const presentCount = filteredLessons.filter((l) => l.attendance_record?.status === "present").length;
  const absentCount = filteredLessons.filter((l) => l.attendance_record?.status === "absent").length;
  const pendingPaymentCount = filteredLessons.filter(
    (l) => l.payment_status !== "paid" && l.booking_payment_status !== "completed"
  ).length;

  const columns = useMemo(
    () =>
      getAttendanceTableColumns({
        onMarkAttendance: handleMarkAttendance,
        onQuickPay: (item) => setQuickPayItem(item),
        onViewBookingDetail: (item) => {
          setSelectedBookingForDetail({
            id: item.booking_id,
            purchaser_name: item.purchaser_name || item.student_name,
            purchaser_email: item.purchaser_email || "",
            student_name: item.student_name,
            course_name: item.course_name,
            payment_status: item.booking_payment_status || "reserved",
            payment_method: item.payment_method || "cash",
            amount_paid: item.amount_paid || 0,
            billing_scheme: item.billing_scheme || "full",
            created_at: item.starts_at,
          } as Booking);
        },
      }),
    []
  );

  const table = useReactTable({
    data: filteredLessons,
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
      <AttendanceMetrics
        totalCount={totalCount}
        presentCount={presentCount}
        absentCount={absentCount}
        pendingPaymentCount={pendingPaymentCount}
      />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cerca studente, corso, docente..."
          filters={[
            {
              value: courseFilter,
              onChange: setCourseFilter,
              placeholder: "Tutti i corsi",
              options: [
                { value: "all", label: "Tutti i corsi" },
                ...courseOptions.map((c) => ({ value: c, label: c })),
              ],
            },
          ]}
          actionElement={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)} className="h-9 px-2.5 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-background text-xs font-bold font-mono">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                <span>{selectedDate}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDateChange(1)} className="h-9 px-2.5 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          }
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
                    <TableRow key={row.id} className="hover:bg-muted/50 transition-all duration-200">
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
                      Nessuna lezione trovata per questa data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <QuickLessonPaymentDialog
        item={quickPayItem}
        open={!!quickPayItem}
        onOpenChange={(v) => !v && setQuickPayItem(null)}
        onSuccess={() => {
          setQuickPayItem(null);
        }}
      />

      <BookingDetailDialog
        booking={selectedBookingForDetail}
        isOpen={!!selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
        onUpdateStatus={() => {}}
        onDelete={async () => false}
      />
    </div>
  );
}
