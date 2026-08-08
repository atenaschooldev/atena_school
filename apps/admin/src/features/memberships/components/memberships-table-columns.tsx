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
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export function getMembershipsTableColumns({
  onToggleStatus,
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
            aria-label="Seleziona tutti"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleziona riga"
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
          <span>Studente / Socio</span>
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
        const name = m.studentName || m.student_name || m.name || "Socio";
        const email = m.studentEmail || m.student_email || m.email || "";
        const taxCode = m.studentTaxCode || m.student_tax_code || m.taxCode || "";

        return (
          <div className="flex flex-col min-w-[180px] gap-0.5">
            <span className="font-medium text-sm text-foreground">{name}</span>
            {email ? <span className="text-xs text-muted-foreground truncate max-w-[200px]">{email}</span> : null}
            {taxCode ? <span className="text-[11px] text-muted-foreground font-mono">CF: {taxCode}</span> : null}
            <CellCopyableId id={m.id} />
          </div>
        );
      },
    },
    {
      accessorKey: "academicYear",
      header: "Anno Accademico",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.academicYear || "2025/2026"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Stato Tessera",
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
          <span>Data Registrazione</span>
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
      header: "Azioni",
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
              onClick={() => onToggleStatus(m.id, m.status)}
              title={isRevoked ? "Riattiva Iscrizione" : "Revoca Iscrizione"}
            >
              {isRevoked ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Riattiva
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5 mr-1" /> Revoca
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ];
}
