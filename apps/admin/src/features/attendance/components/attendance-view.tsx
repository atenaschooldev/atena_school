"use client";

import { useState, useMemo } from "react";
import { BookingPaymentStatus, PaymentMethod, BillingScheme, LessonAttendance, parseLessonAttendance } from "@atena/api-types";
import { useAttendance } from "../hooks/use-attendance";
import { BookingDetailDialog } from "@/features/bookings/components/booking-detail-dialog";
import { AttendanceMetrics } from "./attendance-metrics";
import { getAttendanceTableColumns } from "./attendance-table-columns";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { useTranslation } from "@/i18n/context";
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
  const { t, locale } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
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

  const handleMarkAttendance = async (item: LessonAttendanceItem, status: number) => {
    await markAttendance(item.id, status);
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
  const presentCount = filteredLessons.filter((l) => {
    const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
    return s === LessonAttendance.PRESENT || s === LessonAttendance.LATE;
  }).length;
  const absentCount = filteredLessons.filter((l) => {
    const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
    return s === LessonAttendance.ABSENT;
  }).length;
  const pendingPaymentCount = filteredLessons.filter(
    (l) =>
      Number(l.payment_status) !== BookingPaymentStatus.PAID &&
      l.payment_status !== "paid" &&
      Number(l.booking_payment_status) !== BookingPaymentStatus.PAID &&
      l.booking_payment_status !== "completed"
  ).length;

  const columns = useMemo(
    () =>
      getAttendanceTableColumns({
        onMarkAttendance: handleMarkAttendance,
        onViewBookingDetail: (item) => {
          setSelectedBookingForDetail({
            id: item.booking_id,
            purchaser_name: item.purchaser_name || item.student_name,
            purchaser_email: item.purchaser_email || "",
            student_name: item.student_name,
            course_name: item.course_name,
            payment_status: item.booking_payment_status ?? BookingPaymentStatus.RESERVED,
            payment_method: item.payment_method ?? PaymentMethod.CASH,
            amount_paid: item.amount_paid || 0,
            billing_scheme: item.billing_scheme ?? BillingScheme.FULL,
            created_at: item.starts_at,
          } as Booking);
        },
        t,
      }),
    [t]
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

  const dateLocale = locale === "en" ? "en-US" : "it-IT";

  return (
    <div className="space-y-6">
      <AttendanceMetrics
        totalCount={totalCount}
        presentCount={presentCount}
        absentCount={absentCount}
        pendingPaymentCount={pendingPaymentCount}
      />

      <div className="space-y-4">
        {/* Date Filter & Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleDateChange(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-lg border text-xs font-semibold">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>
                {new Date(selectedDate).toLocaleDateString(dateLocale, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => handleDateChange(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            >
              {t("dashboard.upcomingLessons").split(" ")[0]}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {courseOptions.length > 0 && (
              <select
                aria-label={t("courses.allCategories")}
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-8 text-xs rounded-lg border bg-background px-2.5 font-medium cursor-pointer"
              >
                <option value="all">{t("attendance.allCourses")} ({courseOptions.length})</option>
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("attendance.searchPlaceholder")}
        />

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
                    {t("attendance.noAttendanceFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {selectedBookingForDetail && (
        <BookingDetailDialog
          booking={selectedBookingForDetail}
          open={!!selectedBookingForDetail}
          onOpenChange={(v) => !v && setSelectedBookingForDetail(null)}
        />
      )}
    </div>
  );
}
