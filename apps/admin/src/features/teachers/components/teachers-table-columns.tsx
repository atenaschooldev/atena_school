"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Mail, Phone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import type { Teacher } from "../types";

export interface GetTeachersTableColumnsProps {
  onEdit: (t: Teacher) => void;
  onDelete: (id: string) => void;
  t: (k: string) => string;
}

export function getTeachersTableColumns({
  onEdit,
  onDelete,
  t,
}: GetTeachersTableColumnsProps): ColumnDef<Teacher>[] {
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("teachers.teacherName")} />
      ),
      cell: ({ row }) => {
        const teacher = row.original;
        const name = teacher.fullName || `${teacher.nome || ""} ${teacher.cognome || ""}`.trim() || t("teachers.teacherName");

        return (
          <CellAvatar
            title={name}
            subtitle={teacher.experience || undefined}
            avatarUrl={teacher.photoUrl || undefined}
            icon={UserCheck}
            badgeColor="bg-primary/10 text-primary"
          />
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("teachers.contacts")} />
      ),
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {teacher.email && (
              <span className="inline-flex items-center gap-1.5 truncate max-w-[200px]">
                <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" /> {teacher.email}
              </span>
            )}
            {teacher.telefono && (
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" /> {teacher.telefono}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status || "active"} />,
    },
    {
      accessorKey: "courseCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("teachers.coursesAndLessons")} />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {row.original.courseCount || 0} {t("courses.title").toLowerCase()} • {row.original.lessonCount || 0} {t("courses.calendarLessons").toLowerCase()}
        </span>
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
        const teacher = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onEdit(teacher)}
              title={t("teachers.editTeacher")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400"
              onClick={() => onDelete(teacher.id)}
              title={t("teachers.deleteTeacher")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
