"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, RotateCcw, Award, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { MembershipStatus, parseMembershipStatus } from "@atena/api-types";
import type { Membership } from "../types";

export interface GetMembershipsTableColumnsProps {
  onToggleStatus: (id: string) => void;
  t: (k: string) => string;
}

function MembershipStatusBadge({
  status,
  t,
}: {
  status: MembershipStatus | number | string;
  t: (k: string) => string;
}) {
  const parsed = parseMembershipStatus(status);

  switch (parsed) {
    case MembershipStatus.ACTIVE:
      return (
        <Badge
          variant="secondary"
          className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 shadow-2xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          {t("memberships.membershipActive") || t("common.active")}
        </Badge>
      );

    case MembershipStatus.PENDING:
      return (
        <Badge
          variant="secondary"
          className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30 shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {t("common.pending")}
        </Badge>
      );

    case MembershipStatus.EXPIRED:
      return (
        <Badge
          variant="secondary"
          className="text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 font-semibold gap-1.5 border border-slate-300 shadow-2xs"
        >
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {t("memberships.membershipExpired") || t("common.overdue")}
        </Badge>
      );

    case MembershipStatus.REVOKED:
      return (
        <Badge
          variant="secondary"
          className="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30 shadow-2xs"
        >
          <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          {t("memberships.revoked") || t("common.cancelled")}
        </Badge>
      );

    default:
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-border bg-muted/30 font-medium gap-1 text-xs"
        >
          {String(status)}
        </Badge>
      );
  }
}

export function getMembershipsTableColumns({
  onToggleStatus,
  t,
}: GetMembershipsTableColumnsProps): ColumnDef<Membership>[] {
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
      size: 90,
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.student")} />
      ),
      cell: ({ row }) => {
        const m = row.original;
        const name =
          m.studentName ||
          (m as any).student_name ||
          m.student?.full_name ||
          (m.student?.first_name && m.student?.last_name
            ? `${m.student.first_name} ${m.student.last_name}`
            : null) ||
          t("common.student");
        const taxCode =
          m.studentTaxCode ||
          (m as any).student_tax_code ||
          m.student?.tax_code ||
          m.taxCode;
        const sub = taxCode ? `CF: ${taxCode}` : "";

        return (
          <CellAvatar
            title={name}
            subtitle={sub}
            icon={Award}
            badgeColor="bg-amber-500/10 text-amber-600"
          />
        );
      },
      size: 220,
    },
    {
      accessorKey: "membershipNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.cardNumber")} />
      ),
      cell: ({ row }) => {
        const num =
          row.original.membershipNumber ||
          (row.original as any).membership_number;
        if (!num)
          return <span className="text-xs text-muted-foreground italic">—</span>;
        return (
          <Badge
            variant="outline"
            className="font-mono text-[11px] font-semibold bg-muted/30 border-border/60"
          >
            {num}
          </Badge>
        );
      },
      size: 140,
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("memberships.academicYear")}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs border-border/60">
          {row.original.academicYear || "—"}
        </Badge>
      ),
      size: 130,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("common.amount")}
          className="justify-end text-right pr-2"
        />
      ),
      cell: ({ row }) => {
        const amt = row.original.amount != null ? Number(row.original.amount) : 30;
        return (
          <div className="text-right font-medium pr-2">
            <CellCurrency amount={amt} />
          </div>
        );
      },
      size: 110,
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.paymentMethod")} />
      ),
      cell: ({ row }) => {
        const method = row.original.paymentMethod ?? (row.original as any).payment_method;
        return <PaymentMethodBadge method={method} />;
      },
      size: 160,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.cardStatus")} />
      ),
      cell: ({ row }) => (
        <MembershipStatusBadge status={row.original.status} t={t} />
      ),
      size: 150,
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.expiresAt")} />
      ),
      cell: ({ row }) => {
        const exp = row.original.expiresAt || (row.original as any).expires_at;
        return <CellFormattedDate dateValue={exp} />;
      },
      size: 170,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.date")} />
      ),
      cell: ({ row }) => (
        <CellFormattedDate
          dateValue={row.original.createdAt || (row.original as any).created_at}
        />
      ),
      size: 160,
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-medium text-muted-foreground pr-2">
          {t("common.actions")}
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const m = row.original;
        const isRevoked =
          String(m.status ?? "").toLowerCase() === "revoked" ||
          Number(m.status) === MembershipStatus.REVOKED;
        return (
          <div className="flex items-center justify-end pr-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs cursor-pointer rounded-lg transition-all ${
                isRevoked
                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
              }`}
              onClick={() => onToggleStatus(m.id)}
              title={isRevoked ? t("common.confirm") : t("common.cancel")}
            >
              {isRevoked ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t("common.confirm")}
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5 mr-1" /> {t("common.cancel")}
                </>
              )}
            </Button>
          </div>
        );
      },
      size: 100,
    },
  ];
}
