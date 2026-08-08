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
}

export function getTeachersTableColumns({
  onEdit,
  onDelete,
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Docente</span>
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
        const t = row.original;
        const name = t.fullName || `${t.nome || ""} ${t.cognome || ""}`.trim() || "Docente";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={t.photoUrl || undefined} alt={name} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">{name}</span>
              {t.experience && <span className="text-xs text-muted-foreground">{t.experience}</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contatti",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {t.email && (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                <Mail className="w-3 h-3 text-primary/70 shrink-0" /> {t.email}
              </span>
            )}
            {t.telefono && (
              <span className="inline-flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-primary/70 shrink-0" /> {t.telefono}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Stato",
      cell: ({ row }) => <StatusBadge status={row.original.status || "active"} />,
    },
    {
      accessorKey: "courseCount",
      header: "Corsi / Lezioni",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {row.original.courseCount || 0} corsi • {row.original.lessonCount || 0} lezioni
        </span>
      ),
    },
    {
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(t)}
              title="Modifica Docente"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(t.id)}
              title="Elimina Docente"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
