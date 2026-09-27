"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Receipt, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  PaymentType,
  PaymentRecordStatus,
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <CellCopyableId id={row.original.id} />,
      size: 110,
    },
    {
      accessorKey: "purchaser_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`${t("common.purchaser")} / ${t("common.student")}`} />
      ),
      cell: ({ row }) => {
        const p = row.original;
        const purchaserName = p.purchaser_name || p.purchaserName || p.student_name || t("common.purchaser");
        const purchaserEmail = p.purchaser_email || p.purchaserEmail || p.student_email || "";
        const studentName = p.student_name || p.studentName || p.student?.full_name || (p.student?.first_name && p.student?.last_name ? `${p.student.first_name} ${p.student.last_name}` : p.student?.first_name);
        const isDifferentStudent = studentName && purchaserName && studentName.toLowerCase().trim() !== purchaserName.toLowerCase().trim();

        return (
          <CellAvatar
            title={purchaserName}
            subtitle={
              isDifferentStudent ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Baby className="w-3 h-3 text-primary shrink-0" />
                  <span>{studentName}</span>
                </span>
              ) : undefined
            }
            icon={Receipt}
            badgeColor="bg-primary/10 text-primary"
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("payments.paymentType")} />
      ),
      cell: ({ row }) => {
        const type = Number(row.original.type);
        const desc = row.original.description;

        if (type === PaymentType.REGISTRATION_FEE) {
          return (
            <Badge variant="outline" className="text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold text-[11px] gap-1">
              {t("payments.typeMembership")}
            </Badge>
          );
        }
        if (type === PaymentType.SINGLE_LESSON) {
          return (
            <Badge variant="outline" className="text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30 font-semibold text-[11px]">
              {t("courses.individual")}
            </Badge>
          );
        }
        if (type === PaymentType.COURSE_PAYMENT) {
          return (
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 font-semibold text-[11px]">
              {t("payments.typeTuition")}
            </Badge>
          );
        }
        if (type === PaymentType.DEPOSIT) {
          return (
            <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30 font-semibold text-[11px]">
              {t("payments.typeDeposit")}
            </Badge>
          );
        }
        if (type === PaymentType.INSTALLMENT) {
          return (
            <Badge variant="outline" className="text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30 font-semibold text-[11px]">
              {t("payments.typeInstallment")}
            </Badge>
          );
        }
        if (type === PaymentType.REFUND) {
          return (
            <Badge variant="outline" className="text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30 font-semibold text-[11px]">
              {t("payments.typeRefund")}
            </Badge>
          );
        }

        const label = desc || t("payments.typeTuition");
        return (
          <Badge variant="outline" className="text-slate-700 dark:text-slate-300 bg-slate-500/10 border-slate-500/20 font-semibold text-[11px]">
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("payments.paymentMethod")} />
      ),
      cell: ({ row }) => <PaymentMethodBadge method={row.original.payment_method ?? row.original.paymentMethod} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
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
        <DataTableColumnHeader column={column} title={t("common.amount")} className="justify-end text-right" />
      ),
      cell: ({ row }) => (
        <div className="text-right pr-2">
          <CellCurrency amount={row.original.amount} />
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.date")} />
      ),
      cell: ({ row }) => (
        <CellFormattedDate
          dateValue={
            row.original.createdAt ||
            row.original.created_at ||
            row.original.paidAt ||
            row.original.paid_at
          }
        />
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground">
          {t("common.actions")}
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onViewDetail(p)}
              title={t("common.details")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onEdit(p)}
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400"
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

export { PaymentMethodBadge as getPaymentMethodBadge };
