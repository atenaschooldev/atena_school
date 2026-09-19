"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
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
      header: t("common.student"),
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.student_name}</div>
          <div className="text-xs text-muted-foreground">{row.original.course_name}</div>
        </div>
      ),
    },
    {
      accessorKey: "teacher_name",
      header: t("common.teacher"),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.teacher_name || t("common.unassigned")}</span>
      ),
    },
    {
      accessorKey: "starts_at",
      header: t("common.time"),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.starts_at} />,
    },
    {
      accessorKey: "attendance_record",
      header: t("attendance.title"),
      cell: ({ row }) => {
        const item = row.original;
        const currentStatus = item.attendance_record
          ? parseLessonAttendance(item.attendance_record.status)
          : LessonAttendance.PENDING;
        const isPresent = currentStatus === LessonAttendance.PRESENT || currentStatus === LessonAttendance.LATE;
        const isAbsent = currentStatus === LessonAttendance.ABSENT;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={isPresent ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.PRESENT)}
              className={`h-7 px-2 text-xs font-semibold cursor-pointer ${
                isPresent
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t("attendance.present")}
            </Button>

            <Button
              type="button"
              variant={isAbsent ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.ABSENT)}
              className={`h-7 px-2 text-xs font-semibold cursor-pointer ${
                isAbsent
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
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
      header: t("attendance.coursePaymentStatus"),
      cell: ({ row }) => {
        const item = row.original;
        const bookingStatus = item.booking_payment_status || item.payment_status || "pending";
        return <StatusBadge status={bookingStatus} />;
      },
    },
    {
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onViewBookingDetail(row.original)}
          title={t("attendance.viewBooking")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
