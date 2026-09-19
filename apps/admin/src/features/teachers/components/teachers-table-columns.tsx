"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
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
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("teachers.teacherName")}</span>
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
        const teacher = row.original;
        const name = teacher.fullName || `${teacher.nome || ""} ${teacher.cognome || ""}`.trim() || t("teachers.teacherName");
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={teacher.photoUrl || undefined} alt={name} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">{name}</span>
              {teacher.experience && <span className="text-xs text-muted-foreground">{teacher.experience}</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: t("teachers.contacts"),
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {teacher.email && (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                <Mail className="w-3 h-3 text-primary/70 shrink-0" /> {teacher.email}
              </span>
            )}
            {teacher.telefono && (
              <span className="inline-flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-primary/70 shrink-0" /> {teacher.telefono}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => <StatusBadge status={row.original.status || "active"} />,
    },
    {
      accessorKey: "courseCount",
      header: t("teachers.coursesAndLessons"),
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {row.original.courseCount || 0} {t("courses.title").toLowerCase()} • {row.original.lessonCount || 0} {t("courses.calendarLessons").toLowerCase()}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(teacher)}
              title={t("teachers.editTeacher")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
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
