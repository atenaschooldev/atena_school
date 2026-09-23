"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import type { LessonAttendanceItem } from "../types";
import { LessonAttendance, parseLessonAttendance } from "@atena/api-types";

export interface GetAttendanceTableColumnsProps {
  onMarkAttendance: (item: LessonAttendanceItem, status: number) => void;
  onViewBookingDetail: (item: LessonAttendanceItem) => void;
  t: (k: string) => string;
}

export function getAttendanceTableColumns({
  onMarkAttendance,
  onViewBookingDetail,
  t,
}: GetAttendanceTableColumnsProps): ColumnDef<LessonAttendanceItem>[] {
  return [
    {
      accessorKey: "student_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.student")} />
      ),
      cell: ({ row }) => (
        <CellAvatar
          title={row.original.student_name}
          subtitle={row.original.course_name}
        />
      ),
    },
    {
      accessorKey: "teacher_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.teacher")} />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.teacher_name || t("common.unassigned")}
        </span>
      ),
    },
    {
      accessorKey: "starts_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.time")} />
      ),
      cell: ({ row }) => (
        <CellFormattedDate dateValue={row.original.starts_at} />
      ),
    },
    {
      accessorKey: "attendance_record",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("attendance.title")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const currentStatus = item.attendance_record
          ? parseLessonAttendance(item.attendance_record.status)
          : LessonAttendance.PENDING;
        const isPresent =
          currentStatus === LessonAttendance.PRESENT ||
          currentStatus === LessonAttendance.LATE;
        const isAbsent = currentStatus === LessonAttendance.ABSENT;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={isPresent ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.PRESENT)}
              className={`h-7 px-2.5 text-xs font-semibold cursor-pointer rounded-lg transition-all ${
                isPresent
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t("attendance.present")}
            </Button>

            <Button
              type="button"
              variant={isAbsent ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.ABSENT)}
              className={`h-7 px-2.5 text-xs font-semibold cursor-pointer rounded-lg transition-all ${
                isAbsent
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/20"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> {t("attendance.absentBtn")}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("attendance.coursePaymentStatus")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const bookingStatus =
          item.booking_payment_status || item.payment_status || "pending";
        return <StatusBadge status={bookingStatus} />;
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
            onClick={() => onViewBookingDetail(row.original)}
            title={t("attendance.viewBooking")}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
