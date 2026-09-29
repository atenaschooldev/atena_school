"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Baby, User } from "lucide-react";
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <CellCopyableId id={row.original.id || row.original.booking_id} />,
      size: 90,
    },
    {
      accessorKey: "course_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.course")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <CellAvatar
            title={item.course_name}
            icon={BookOpen}
            badgeColor="bg-primary/10 text-primary"
          />
        );
      },
      size: 200,
    },
    {
      accessorKey: "student_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.student")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isChild = Boolean(
          item.purchaser_name &&
          item.student_name &&
          item.purchaser_name.toLowerCase().trim() !== item.student_name.toLowerCase().trim()
        );
        const taxCode = item.student_tax_code ? `CF: ${item.student_tax_code}` : null;

        return (
          <CellAvatar
            title={item.student_name}
            subtitle={
              isChild ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Baby className="w-3 h-3 text-primary shrink-0" />
                  <span>{item.purchaser_name}</span>
                  {taxCode && <span className="text-muted-foreground font-normal">• {taxCode}</span>}
                </span>
              ) : (
                taxCode || undefined
              )
            }
            icon={User}
            badgeColor="bg-muted text-foreground"
          />
        );
      },
      size: 220,
    },
    {
      accessorKey: "billing_scheme",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.billingScheme")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isSub = item.billing_scheme === 2;
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            {isSub ? (
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 w-fit text-xs">
                <RefreshCw className="h-3 w-3 animate-spin-slow" />
                {t("activeServices.subscription")}
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit text-xs font-normal border-border/60">
                {t("activeServices.fullPayment")}
              </Badge>
            )}
            <div className="text-xs font-medium text-foreground">
              <CellCurrency amount={item.amount_paid || 0} />
            </div>
          </div>
        );
      },
      size: 160,
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.lessonProgress")} />
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
                {completed} / {total} {t("activeServices.lessons")}
              </span>
              <span className="text-muted-foreground font-medium text-[11px]">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-1.5 bg-muted" />
            <span className="text-[11px] text-muted-foreground">
              {remaining} {t("activeServices.remaining")}
            </span>
          </div>
        );
      },
      size: 180,
    },
    {
      accessorKey: "next_lesson_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.nextLesson")} />
      ),
      cell: ({ row }) => {
        const item = row.original;
        if (!item.next_lesson_at) {
          return (
            <span className="text-xs text-muted-foreground italic">
              {t("activeServices.noUpcomingLessons")}
            </span>
          );
        }
        return <CellFormattedDate dateValue={item.next_lesson_at} />;
      },
      size: 170,
    },
    {
      accessorKey: "student_annual_fee_paid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("activeServices.annualFee")} />
      ),
      cell: ({ row }) => {
        const isPaid = row.original.student_annual_fee_paid;
        return isPaid ? (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 w-fit text-xs">
            <CheckCircle2 className="h-3 w-3" />
            {t("activeServices.feePaid")}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 w-fit text-xs">
            <AlertCircle className="h-3 w-3" />
            {t("activeServices.feePending")}
          </Badge>
        );
      },
      size: 150,
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground pr-2">
          {t("common.actions")}
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end pr-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer rounded-lg border-border/60 hover:bg-muted/80"
              onClick={() => onViewDetail(item)}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{t("common.details")}</span>
            </Button>
          </div>
        );
      },
      size: 110,
    },
  ];
}
