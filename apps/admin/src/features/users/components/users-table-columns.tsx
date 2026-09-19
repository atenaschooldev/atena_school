"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { UserRole, parseUserRole } from "@atena/api-types";
import type { User } from "../types";

export interface GetUsersTableColumnsProps {
  onEdit: (u: User) => void;
  onDelete: (id: string) => void;
  t: (k: string) => string;
}

export function getUsersTableColumns({
  onEdit,
  onDelete,
  t,
}: GetUsersTableColumnsProps): ColumnDef<User>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>{t("users.studentProfile")}</span>
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
        const u = row.original;
        const name = u.name || t("common.student");
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border">
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{u.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: t("users.role"),
      cell: ({ row }) => {
        const role = parseUserRole(row.original.role);
        if (role === UserRole.ADMIN || role === UserRole.SUPERADMIN) {
          return (
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 border border-purple-500/30 gap-1 text-xs">
              <Shield className="w-3 h-3 text-purple-500" /> {t("roles.admin")}
            </Badge>
          );
        }
        if (role === UserRole.TEACHER) {
          return (
            <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/20 border border-sky-500/30 gap-1 text-xs">
              <UserIcon className="w-3 h-3 text-sky-500" /> {t("roles.teacher")}
            </Badge>
          );
        }
        if (role === UserRole.SECRETARY) {
          return (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 border border-amber-500/30 gap-1 text-xs">
              <UserIcon className="w-3 h-3 text-amber-500" /> {t("roles.secretary")}
            </Badge>
          );
        }
        if (role === UserRole.PARENT) {
          return (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-500/30 gap-1 text-xs">
              <UserIcon className="w-3 h-3 text-emerald-500" /> {t("roles.parent")}
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-xs">
            {t("roles.student")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("users.creationDate"),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.createdAt || row.original.created_at} />,
    },
    {
      id: "actions",
      header: t("common.actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(u)}
              title={t("users.editUser")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(u.id)}
              title={t("users.deleteUser")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
