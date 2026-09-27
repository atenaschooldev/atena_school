"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Trash2,
  Shield,
  User as UserIcon,
  GraduationCap,
  Briefcase,
  Baby,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => <CellCopyableId id={row.original.id} />,
      size: 90,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("users.userProfile")} />
      ),
      cell: ({ row }) => {
        const u = row.original;
        const name =
          u.fullName ||
          (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : null) ||
          u.firstName ||
          u.name ||
          (u.email ? u.email.split("@")[0] : null) ||
          t("common.user");
        const taxCode = u.taxCode;
        const sub = [u.email, taxCode ? `CF: ${taxCode}` : ""].filter(Boolean).join(" • ");

        const role = parseUserRole(u.role);
        const icon =
          role === UserRole.ADMIN || role === UserRole.SUPERADMIN
            ? Shield
            : role === UserRole.TEACHER
            ? GraduationCap
            : role === UserRole.SECRETARY
            ? Briefcase
            : role === UserRole.PARENT
            ? Baby
            : UserIcon;

        const badgeColor =
          role === UserRole.ADMIN || role === UserRole.SUPERADMIN
            ? "bg-purple-500/10 text-purple-600"
            : role === UserRole.TEACHER
            ? "bg-sky-500/10 text-sky-600"
            : role === UserRole.SECRETARY
            ? "bg-amber-500/10 text-amber-600"
            : role === UserRole.PARENT
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-muted text-foreground";

        return (
          <CellAvatar
            title={name}
            subtitle={sub}
            icon={icon}
            badgeColor={badgeColor}
          />
        );
      },
      size: 240,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("users.role")} />
      ),
      cell: ({ row }) => {
        const role = parseUserRole(row.original.role);
        if (role === UserRole.ADMIN || role === UserRole.SUPERADMIN) {
          return (
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 border border-purple-500/30 gap-1 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>{t("roles.admin")}</span>
            </Badge>
          );
        }
        if (role === UserRole.TEACHER) {
          return (
            <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/20 border border-sky-500/30 gap-1 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
              <span>{t("roles.teacher")}</span>
            </Badge>
          );
        }
        if (role === UserRole.SECRETARY) {
          return (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 border border-amber-500/30 gap-1 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("roles.secretary")}</span>
            </Badge>
          );
        }
        if (role === UserRole.PARENT) {
          return (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-500/30 gap-1 text-xs font-semibold">
              <Baby className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("roles.parent")}</span>
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-xs font-medium border-border/60 bg-muted/30">
            {t("roles.student")}
          </Badge>
        );
      },
      size: 160,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("common.status")} />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        return isActive ? (
          <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 text-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>{t("common.active")}</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground border-border/60 bg-muted/30 font-medium gap-1 text-xs">
            <XCircle className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>{t("common.inactive")}</span>
          </Badge>
        );
      },
      size: 130,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("users.creationDate")} />
      ),
      cell: ({ row }) => (
        <CellFormattedDate
          dateValue={row.original.createdAt || row.original.created_at}
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
        const u = row.original;
        return (
          <div className="flex items-center justify-end pr-1 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
              onClick={() => onEdit(u)}
              title={t("users.editUser")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400"
              onClick={() => onDelete(u.id)}
              title={t("users.deleteUser")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      size: 100,
    },
  ];
}
