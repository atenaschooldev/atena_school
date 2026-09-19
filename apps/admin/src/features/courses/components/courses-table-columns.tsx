"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellCurrency } from "@/components/shared/cell-currency";
import type { Course } from "../types";

import { formatCourseFrequencyDetails } from "@atena/utils";
import { formatCourseFormatLabel, formatCategoryLabel } from "../utils";

export interface GetCoursesTableColumnsProps {
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
  t: (k: string) => string;
}

export function getCoursesTableColumns({
  onEdit,
  onDelete,
  t,
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
      accessorKey: "nome",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("courses.courseName")}</span>
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
        <div className="flex items-center gap-3 min-w-[220px]">
          {row.original.foto ? (
            <img
              src={row.original.foto}
              alt={row.original.nome}
              className="h-9 w-9 rounded-lg object-cover shrink-0 border border-border/50"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-primary/20">
              {row.original.nome ? row.original.nome.slice(0, 2) : "CO"}
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-bold text-sm text-foreground truncate">{row.original.nome}</span>
            {row.original.categoria && (
              <span className="text-xs text-muted-foreground truncate">
                {formatCategoryLabel(row.original.categoria, t)}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "courseFormat",
      header: t("courses.format"),
      cell: ({ row }) => {
        const label = formatCourseFormatLabel(row.original.courseFormat, t);
        return (
          <Badge variant="outline" className="text-xs font-medium">
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "stato",
      header: t("common.status"),
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
          <span>{t("courses.price")}</span>
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
      header: t("courses.schedule"),
      cell: ({ row }) => {
        const { primary, secondary } = formatCourseFrequencyDetails(row.original);

        return (
          <div className="flex items-start gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-medium text-foreground truncate">{primary}</span>
              {secondary && secondary !== primary && (
                <span className="text-[11px] text-muted-foreground truncate">{secondary}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("common.actions"),
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
              title={t("courses.editCourse")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(c)}
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
