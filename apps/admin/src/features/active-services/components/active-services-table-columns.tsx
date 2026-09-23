"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, CheckCircle2, AlertCircle, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
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
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.course") || "Corso"}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col min-w-[200px] gap-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{item.course_name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {item.course_category && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {item.course_category}
                </Badge>
              )}
              {item.course_format && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {item.course_format}
                </Badge>
              )}
            </div>
            <CellCopyableId id={item.booking_id} />
          </div>
        );
      },
    },
    {
      accessorKey: "student_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.student") || "Studente"}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isChild = Boolean(item.purchaser_name && item.purchaser_name !== item.student_name);
        return (
          <div className="flex flex-col min-w-[180px] gap-0.5">
            <span className="font-medium text-sm text-foreground">{item.student_name}</span>
            {isChild && (
              <span className="text-xs text-muted-foreground">
                {t("bookings.parent") || "Genitore"}: {item.purchaser_name}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{item.student_email || item.purchaser_email}</span>
            </div>
            {item.student_tax_code && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.student_tax_code}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "billing_scheme",
      header: t("common.billingScheme") || "Piano / Pagamento",
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
              <Badge variant="outline" className="w-fit text-xs font-normal">
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
      header: t("activeServices.lessonProgress") || "Progresso Lezioni",
      cell: ({ row }) => {
        const item = row.original;
        const total = item.total_lessons_count || item.scheduled_lessons_count || 0;
        const completed = item.completed_lessons_count || 0;
        const remaining = item.remaining_lessons_count || 0;
        const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

        return (
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {completed} / {total} {t("activeServices.lessons") || "lezioni"}
              </span>
              <span className="text-muted-foreground font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <span className="text-[11px] text-muted-foreground">
              {remaining} {t("activeServices.remaining") || "rimanenti"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "next_lesson_at",
      header: t("activeServices.nextLesson") || "Prossima Lezione",
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
      header: t("activeServices.annualFee") || "Quota Associativa",
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
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
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
