"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import type { Booking } from "../types/booking";

export interface GetBookingsTableColumnsProps {
  onViewDetail: (b: Booking) => void;
  onEdit: (b: Booking) => void;
  onDelete: (id: string) => void;
  t: (k: string) => string;
}

export function getBookingsTableColumns({
  onViewDetail,
  onEdit,
  onDelete,
  t,
}: GetBookingsTableColumnsProps): ColumnDef<Booking>[] {
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
      accessorKey: "course_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.course")} />
      ),
      cell: ({ row }) => {
        const b = row.original;
        return (
          <CellAvatar
            title={b.course_name}
            icon={BookOpen}
            badgeColor="bg-primary/10 text-primary"
          />
        );
      },
    },
    {
      accessorKey: "purchaser_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`${t("common.purchaser")} / ${t("common.student")}`} />
      ),
      cell: ({ row }) => {
        const b = row.original;
        const diffStudent = b.student_name && b.student_name !== b.purchaser_name;
        const sub = diffStudent
          ? `${t("common.student")}: ${b.student_name}`
          : b.purchaser_email || "";

        return (
          <CellAvatar
            title={b.purchaser_name}
            subtitle={sub}
            icon={User}
            badgeColor="bg-muted text-foreground"
          />
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.payment_status} />,
    },
    {
      accessorKey: "payment_method",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("payments.filterMethod")} />
      ),
      cell: ({ row }) => (
        <PaymentMethodBadge method={row.original.payment_method} />
      ),
    },
    {
      accessorKey: "amount_paid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.amount")} />
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.amount_paid || 0)} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.date")} />
      ),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.created_at} />,
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
        const b = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onViewDetail(b)}
              title={t("common.details")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onEdit(b)}
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400"
              onClick={() => onDelete(b.id)}
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
