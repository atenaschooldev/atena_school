"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ban, RotateCcw, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import type { Membership } from "../types";

export interface GetMembershipsTableColumnsProps {
  onToggleStatus: (id: string) => void;
  t: (k: string) => string;
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
      size: 110,
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.student")} />
      ),
      cell: ({ row }) => {
        const m = row.original;
        const name = m.studentName || m.student_name || t("common.student");
        const email = m.studentEmail || m.student_email || "";
        const taxCode = m.studentTaxCode || m.student_tax_code || "";
        const sub = [email, taxCode ? `CF: ${taxCode}` : ""].filter(Boolean).join(" • ");

        return (
          <CellAvatar
            title={name}
            subtitle={sub}
            icon={Award}
            badgeColor="bg-amber-500/10 text-amber-600"
          />
        );
      },
    },
    {
      accessorKey: "membershipNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.cardNumber")} />
      ),
      cell: ({ row }) => {
        const num = row.original.membershipNumber || (row.original as any).membership_number;
        if (!num) return <span className="text-xs text-muted-foreground italic">—</span>;
        return (
          <Badge variant="outline" className="font-mono text-[11px] font-semibold bg-muted/30 border-border/60">
            {num}
          </Badge>
        );
      },
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.academicYear")} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs border-border/60">
          {row.original.academicYear || "—"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("memberships.cardStatus")} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status || "active"} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.date")} />
      ),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.createdAt || row.original.created_at} />,
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
        const m = row.original;
        const isRevoked = String(m.status ?? "").toLowerCase() === "revoked" || Number(m.status) === 2;
        return (
          <div className="flex items-center justify-end gap-1">
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
    },
  ];
}
