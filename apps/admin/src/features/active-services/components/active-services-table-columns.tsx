"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle2, AlertCircle, RefreshCw, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import type { ActiveServiceItem } from "../types/active-service";

export interface GetActiveServicesTableColumnsProps {
  onViewDetail: (item: ActiveServiceItem) => void;
  t: (k: string) => string;
}

export function getActiveServicesTableColumns({
  onViewDetail,
  t,
}: GetActiveServicesTableColumnsProps): ColumnDef<ActiveServiceItem>[] {
  return [
    {
      accessorKey: "course_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.course") || "Corso"} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const sub = [item.course_category, item.course_format].filter(Boolean).join(" • ");
        return (
          <div className="flex flex-col gap-0.5">
            <CellAvatar
              title={item.course_name}
              subtitle={sub}
              icon={BookOpen}
              badgeColor="bg-primary/10 text-primary"
            />
            <div className="pl-11">
              <CellCopyableId id={item.booking_id} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "student_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.student") || "Studente"} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isChild = Boolean(item.purchaser_name && item.purchaser_name !== item.student_name);
        const sub = [
          isChild ? `${t("bookings.parent") || "Genitore"}: ${item.purchaser_name}` : null,
          item.student_email || item.purchaser_email,
          item.student_tax_code ? `CF: ${item.student_tax_code}` : null,
        ].filter(Boolean).join(" • ");

        return (
          <CellAvatar
            title={item.student_name}
            subtitle={sub}
          />
        );
      },
    },
    {
      accessorKey: "billing_scheme",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.billingScheme") || "Piano / Pagamento"} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isSub = item.billing_scheme === 2;
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            {isSub ? (
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 w-fit text-xs">
                <RefreshCw className="h-3 w-3 animate-spin-slow" />
                {t("activeServices.subscription") || "Abbonamento"}
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit text-xs font-normal border-border/60">
                {t("activeServices.fullPayment") || "Pagamento Unico"}
              </Badge>
            )}
            <div className="text-xs font-medium text-foreground">
              <CellCurrency amount={item.amount_paid || 0} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.lessonProgress") || "Progresso Lezioni"} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const total = item.total_lessons_count || item.scheduled_lessons_count || 0;
        const completed = item.completed_lessons_count || 0;
        const remaining = item.remaining_lessons_count || 0;
        const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {completed} / {total} {t("activeServices.lessons") || "lezioni"}
              </span>
              <span className="text-muted-foreground font-medium text-[11px]">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-1.5 bg-muted" />
            <span className="text-[11px] text-muted-foreground">
              {remaining} {t("activeServices.remaining") || "rimanenti"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "next_lesson_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.nextLesson") || "Prossima Lezione"} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        if (!item.next_lesson_at) {
          return (
            <span className="text-xs text-muted-foreground italic">
              {t("activeServices.noUpcomingLessons") || "Nessuna programmata"}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <CellFormattedDate value={item.next_lesson_at} />
          </div>
        );
      },
    },
    {
      accessorKey: "student_annual_fee_paid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.annualFee") || "Quota Associativa"} />
      ),
      cell: ({ row }) => {
        const isPaid = row.original.student_annual_fee_paid;
        return isPaid ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 w-fit text-xs">
            <CheckCircle2 className="h-3 w-3" />
            {t("activeServices.feePaid") || "Regolare"}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 w-fit text-xs">
            <AlertCircle className="h-3 w-3" />
            {t("activeServices.feePending") || "Da pagare"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
              onClick={() => onViewDetail(item)}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{t("common.details") || "Dettagli"}</span>
            </Button>
          </div>
        );
      },
    },
  ];
}
