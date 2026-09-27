"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Receipt } from "lucide-react";
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
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold text-primary">
                    Studente: {studentName}
                  </span>
                  {purchaserEmail && <span className="text-[10px] text-muted-foreground">{purchaserEmail}</span>}
                </div>
              ) : (
                purchaserEmail
              )
            }
            icon={Receipt}
            badgeColor="bg-emerald-500/10 text-emerald-600"
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
            <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
              {t("payments.typeMembership")}
            </Badge>
          );
        }
        if (type === PaymentType.SINGLE_LESSON) {
          return (
            <Badge variant="outline" className="text-purple-600 bg-purple-500/10 border-purple-500/30">
              {t("courses.individual")}
            </Badge>
          );
        }
        let label = t("payments.typeTuition");
        if (type === PaymentType.COURSE_PAYMENT) {
          label = t("payments.typeTuition");
        } else if (type === PaymentType.DEPOSIT) {
          label = t("payments.typeDeposit");
        } else if (type === PaymentType.INSTALLMENT) {
          label = t("payments.typeInstallment");
        } else if (type === PaymentType.REFUND) {
          label = t("payments.typeRefund");
        } else if (desc) {
          label = desc;
        }

        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{label}</span>
          </div>
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
        <DataTableColumnHeader column={column} title={t("common.amount")} />
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.amount || 0)} />,
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
