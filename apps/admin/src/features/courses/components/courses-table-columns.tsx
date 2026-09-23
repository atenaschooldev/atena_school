"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CellCurrency } from "@/components/shared/cell-currency";
import {
  DataTableColumnHeader,
  CellAvatar,
  CellSchedule,
} from "@/components/shared/data-table";
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
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("courses.courseName")} />
      ),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <CellAvatar
            title={c.nome}
            subtitle={c.categoria ? formatCategoryLabel(c.categoria, t) : undefined}
            imageUrl={c.foto}
            fallbackText={c.nome ? c.nome.slice(0, 2) : "CO"}
          />
        );
      },
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
        <DataTableColumnHeader column={column} title={t("courses.price")} />
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.prezzo || 0)} />,
    },
    {
      accessorKey: "scheduleType",
      header: t("courses.schedule"),
      cell: ({ row }) => {
        const { primary, secondary } = formatCourseFrequencyDetails(row.original);
        return <CellSchedule primary={primary} secondary={secondary} />;
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
