"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  PaymentType,
  PaymentRecordStatus,
  PAYMENT_TYPE_DICTIONARY,
} from "@atena/api-types";
import type { Payment } from "../types";

export interface GetPaymentsTableColumnsProps {
  onViewDetail: (p: Payment) => void;
  onEdit: (p: Payment) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: number) => void;
  t: (k: string) => string;
}

export function getPaymentsTableColumns({
  onViewDetail,
  onEdit,
  onDelete,
  onStatusChange,
  t,
}: GetPaymentsTableColumnsProps): ColumnDef<Payment>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t("common.selectAll")}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t("common.selectRow")}
          />
        </div>
      ),
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: "purchaser_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.purchaser")} / {t("common.student")}</span>
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
        const p = row.original;
        const name = p.purchaser_name || p.purchaserName || p.student_name || t("common.purchaser");
        const email = p.purchaser_email || p.purchaserEmail || p.student_email || "";

        const id = p.id;
        return (
          <div className="flex flex-col min-w-[200px] gap-0.5">
            <span className="font-bold text-sm text-foreground">{name}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CellCopyableId id={id} />
              {email && <span>• {email}</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: t("payments.paymentType"),
      cell: ({ row }) => {
        const type = Number(row.original.type);
        const desc = row.original.description;
        if (type === PaymentType.REGISTRATION_FEE) {
          return (
            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30">
              {t("payments.typeMembership")}
            </Badge>
          );
        }
        if (type === PaymentType.SINGLE_LESSON) {
          return (
            <Badge variant="outline" className="text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-500/30">
              {t("courses.individual")}
            </Badge>
          );
        }
        const label = PAYMENT_TYPE_DICTIONARY[type as PaymentType]?.label_it || PAYMENT_TYPE_DICTIONARY[type as PaymentType]?.it || desc || t("payments.typeTuition");
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: t("payments.filterMethod"),
      cell: ({ row }) => <PaymentMethodBadge method={row.original.payment_method ?? row.original.paymentMethod} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.status")}</span>
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
        const payment = row.original;
        const statusNum = Number(payment.status);
        const currentVal = String(statusNum);

        const renderBadge = (st: number) => {
          if (st === PaymentRecordStatus.SUCCEEDED) {
            return (
              <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30">
                {t("common.paid")}
              </Badge>
            );
          }
          if (st === PaymentRecordStatus.FAILED) {
            return (
              <Badge variant="secondary" className="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30">
                {t("common.failed")}
              </Badge>
            );
          }
          if (st === PaymentRecordStatus.REFUNDED) {
            return (
              <Badge variant="secondary" className="text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 font-semibold gap-1.5 border border-slate-300">
                {t("common.refunded")}
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30">
              {t("common.pending")}
            </Badge>
          );
        };

        if (!onStatusChange) {
          return renderBadge(statusNum);
        }

        return (
          <Select value={currentVal} onValueChange={(val) => onStatusChange(payment.id, Number(val))}>
            <SelectTrigger className="h-8 w-auto border-0 p-0 shadow-none bg-transparent hover:opacity-80 focus:ring-0 cursor-pointer">
              {renderBadge(statusNum)}
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value={String(PaymentRecordStatus.SUCCEEDED)} className="text-xs cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400">
                {t("common.paid")}
              </SelectItem>
              <SelectItem value={String(PaymentRecordStatus.PENDING)} className="text-xs cursor-pointer font-semibold text-amber-600 dark:text-amber-400">
                {t("common.pending")}
              </SelectItem>
              <SelectItem value={String(PaymentRecordStatus.FAILED)} className="text-xs cursor-pointer font-semibold text-rose-600 dark:text-rose-400">
                {t("common.failed")}
              </SelectItem>
              <SelectItem value={String(PaymentRecordStatus.REFUNDED)} className="text-xs cursor-pointer font-semibold text-slate-600 dark:text-slate-400">
                {t("common.refunded")}
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.amount")}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.amount || 0)} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.date")}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.created_at || row.original.paid_at} />,
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onViewDetail(p)}
              title={t("common.details")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(p)}
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(p.id)}
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

// Helper export needed by bookings view
export { PaymentMethodBadge as getPaymentMethodBadge };
