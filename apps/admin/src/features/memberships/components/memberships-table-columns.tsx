"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
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
      accessorKey: "studentName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("common.student")}</span>
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
        const m = row.original;
        const name = m.studentName || m.student_name || t("common.student");
        const email = m.studentEmail || m.student_email || "";
        const taxCode = m.studentTaxCode || m.student_tax_code || "";

        return (
          <div className="flex flex-col min-w-[180px] gap-0.5">
            <span className="font-bold text-sm text-foreground">{name}</span>
            {email ? <span className="text-xs text-muted-foreground truncate max-w-[200px]">{email}</span> : null}
            {taxCode ? <span className="text-[11px] text-muted-foreground font-mono">CF: {taxCode}</span> : null}
            <CellCopyableId id={m.id} />
          </div>
        );
      },
    },
    {
      accessorKey: "academicYear",
      header: t("memberships.academicYear"),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.academicYear || "2026/2027"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("memberships.cardStatus"),
      cell: ({ row }) => <StatusBadge status={row.original.status || "active"} />,
    },
    {
      accessorKey: "createdAt",
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
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.createdAt || row.original.created_at} />,
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const m = row.original;
        const isRevoked = (m.status || "").toLowerCase() === "revoked";
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs cursor-pointer ${
                isRevoked
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-rose-600 hover:text-rose-700"
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
