"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle2, XCircle, Clock, AlertCircle, GraduationCap, ShieldCheck } from "lucide-react";
import type { BookingAttendanceStats } from "../types";

import { apiFetch } from "@/lib/api";

interface AttendanceDetailDialogProps {
  bookingId: string | null;
  studentName?: string;
  courseName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceDetailDialog({
  bookingId,
  studentName,
  courseName,
  open,
  onOpenChange,
}: AttendanceDetailDialogProps) {
  const { data: stats } = useQuery<BookingAttendanceStats | null>({
    queryKey: ["attendance-stats", bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      try {
        return await apiFetch<BookingAttendanceStats>(`/admin/attendance/stats/${bookingId}`);
      } catch {
        return null;
      }
    },
    enabled: open && Boolean(bookingId),
  });

  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Award className="w-5 h-5" />
            <DialogTitle>Dettagli Presenza & Certificato</DialogTitle>
          </div>
          <DialogDescription>
            Report presenze per <span className="font-semibold text-foreground">{studentName}</span> ({courseName})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Certificate Badge Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              stats.eligible_for_certificate
                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                : "bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/30 text-amber-900 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-background shadow-2xs">
                {stats.eligible_for_certificate ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {stats.eligible_for_certificate
                    ? "Idoneo al Certificato"
                    : "Presenza Incompleta (< 80%)"}
                </p>
                <p className="text-xs opacity-80">
                  {stats.eligible_for_certificate
                    ? "Lo studente ha raggiunto il 80%+ di presenza richiesto."
                    : "Mancano lezioni per raggiungere la soglia di attestato."}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`font-bold text-sm px-3 py-1 ${
                stats.eligible_for_certificate
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {stats.attendance_rate}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span>Avanzamento Presenze</span>
              <span>
                {stats.present_count} su {stats.total_records} lezioni
              </span>
            </div>
            <Progress value={stats.attendance_rate} className="h-2.5" />
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border text-center p-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Presente</p>
              <p className="text-lg font-bold text-emerald-600">{stats.present_count}</p>
            </Card>

            <Card className="border text-center p-3">
              <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Assente</p>
              <p className="text-lg font-bold text-rose-600">{stats.absent_count}</p>
            </Card>

            <Card className="border text-center p-3">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-medium">Giustificato</p>
              <p className="text-lg font-bold text-amber-600">{stats.excused_count}</p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
