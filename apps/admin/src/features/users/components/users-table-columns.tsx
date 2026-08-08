"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import type { User } from "../types";

export interface GetUsersTableColumnsProps {
  onEdit: (u: User) => void;
  onDelete: (id: string) => void;
}

export function getUsersTableColumns({
  onEdit,
  onDelete,
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
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Utente</span>
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
        const name = u.name || "Utente";
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
      header: "Ruolo",
      cell: ({ row }) => {
        const role = (row.original.role || "").toLowerCase();
        if (role === "admin") {
          return (
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950/20 border border-purple-500/30 gap-1 text-xs">
              <Shield className="w-3 h-3 text-purple-500" /> Admin
            </Badge>
          );
        }
        if (role === "teacher") {
          return (
            <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950/20 border border-sky-500/30 gap-1 text-xs">
              <UserIcon className="w-3 h-3 text-sky-500" /> Docente
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-xs">
            Studente
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data Creazione",
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.createdAt || row.original.created_at} />,
    },
    {
      id: "actions",
      header: "Azioni",
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
              title="Modifica Utente"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(u.id)}
              title="Elimina Utente"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
