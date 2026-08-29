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
import type { Payment } from "../types";

export interface GetPaymentsTableColumnsProps {
  onViewDetail: (p: Payment) => void;
  onEdit: (p: Payment) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
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
        const type = row.original.type;
        const desc = row.original.description;
        if (type === "registration_fee") {
          return (
            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30">
              {t("payments.typeMembership")}
            </Badge>
          );
        }
        if (type === "lesson_fee") {
          return (
            <Badge variant="outline" className="text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-500/30">
              {t("courses.individual")}
            </Badge>
          );
        }
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{desc || t("payments.typeTuition")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: t("payments.filterMethod"),
      cell: ({ row }) => <PaymentMethodBadge method={row.original.payment_method} />,
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
        const norm = (payment.status || "pending").toLowerCase().trim();
        const currentVal = norm === "paid" || norm === "succeeded" ? "completed" : norm;

        if (!onStatusChange) {
          return <StatusBadge status={currentVal} />;
        }

        return (
          <Select value={currentVal} onValueChange={(val) => onStatusChange(payment.id, val)}>
            <SelectTrigger className="h-8 w-auto border-0 p-0 shadow-none bg-transparent hover:opacity-80 focus:ring-0 cursor-pointer">
              <StatusBadge status={currentVal} />
            </SelectTrigger>
            <SelectContent side="bottom" align="start">
              <SelectItem value="completed" className="text-xs cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400">
                {t("common.paid")}
              </SelectItem>
              <SelectItem value="pending" className="text-xs cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400">
                {t("common.pending")}
              </SelectItem>
              <SelectItem value="failed" className="text-xs cursor-pointer font-semibold text-rose-600 dark:text-rose-400">
                {t("common.failed")}
              </SelectItem>
              <SelectItem value="refunded" className="text-xs cursor-pointer font-semibold text-slate-600 dark:text-slate-400">
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
