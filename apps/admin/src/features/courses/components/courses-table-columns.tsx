"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellCurrency } from "@/components/shared/cell-currency";
import type { Course } from "../types";

export interface GetCoursesTableColumnsProps {
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}

export function getCoursesTableColumns({
  onEdit,
  onDelete,
}: GetCoursesTableColumnsProps): ColumnDef<Course>[] {
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
      accessorKey: "nome",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Corso</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[200px] gap-0.5">
          <span className="font-bold text-sm text-foreground">{row.original.nome}</span>
          {row.original.categoria && (
            <span className="text-xs text-muted-foreground">{row.original.categoria}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "courseFormat",
      header: "Formato",
      cell: ({ row }) => {
        const fmt = row.original.courseFormat;
        return (
          <Badge variant="outline" className="text-xs font-medium">
            {fmt === "individual" ? "Individuale" : fmt === "pairs" ? "Coppia" : "Gruppo"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "stato",
      header: "Stato",
      cell: ({ row }) => <StatusBadge status={row.original.stato || "attivo"} />,
    },
    {
      accessorKey: "prezzo",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Prezzo</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.prezzo || 0)} />,
    },
    {
      accessorKey: "scheduleType",
      header: "Frequenza",
      cell: ({ row }) => {
        const isFlex = row.original.scheduleType === "flexible";
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>{isFlex ? "Flessibile" : "Fissa"}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(c)}
              title="Modifica Corso"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(c)}
              title="Elimina Corso"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
