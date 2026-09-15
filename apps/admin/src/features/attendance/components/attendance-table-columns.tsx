"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import type { LessonAttendanceItem } from "../types";
import { LessonAttendance } from "@atena/api-types";

export interface GetAttendanceTableColumnsProps {
  onMarkAttendance: (item: LessonAttendanceItem, status: number) => void;
  onViewBookingDetail: (item: LessonAttendanceItem) => void;
}

export function getAttendanceTableColumns({
  onMarkAttendance,
  onViewBookingDetail,
}: GetAttendanceTableColumnsProps): ColumnDef<LessonAttendanceItem>[] {
  return [
    {
      accessorKey: "student_name",
      header: "Studente",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">{row.original.student_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.course_name}</span>
        </div>
      ),
    },
    {
      accessorKey: "starts_at",
      header: "Orario",
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.starts_at} />,
    },
    {
      accessorKey: "attendance_record",
      header: "Presenza",
      cell: ({ row }) => {
        const item = row.original;
        const currentStatus = item.attendance_record?.status;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={currentStatus === "present" ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.PRESENT)}
              className={`h-7 px-2 text-xs font-semibold cursor-pointer ${
                currentStatus === "present"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Presente
            </Button>

            <Button
              type="button"
              variant={currentStatus === "absent" ? "default" : "outline"}
              size="sm"
              onClick={() => onMarkAttendance(item, LessonAttendance.ABSENT)}
              className={`h-7 px-2 text-xs font-semibold cursor-pointer ${
                currentStatus === "absent"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Assente
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Stato Pagamento Corso",
      cell: ({ row }) => {
        const item = row.original;
        const bookingStatus = item.booking_payment_status || item.payment_status || "pending";
        return <StatusBadge status={bookingStatus} />;
      },
    },
    {
      id: "actions",
      header: "Azioni",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => onViewBookingDetail(row.original)}
          title="Vedi Ordine"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
