"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { CellFormattedDate } from "@/components/shared/cell-formatted-date";
import { CellCurrency } from "@/components/shared/cell-currency";
import type { Booking } from "../types/booking";

export interface GetBookingsTableColumnsProps {
  onViewDetail: (b: Booking) => void;
  onEdit: (b: Booking) => void;
  onDelete: (id: string) => void;
}

export function getBookingsTableColumns({
  onViewDetail,
  onEdit,
  onDelete,
}: GetBookingsTableColumnsProps): ColumnDef<Booking>[] {
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
      accessorKey: "course_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Corso / Servizio</span>
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
        <div className="flex flex-col min-w-[180px] gap-0.5">
          <span className="font-medium text-sm text-foreground">{row.original.course_name}</span>
          <CellCopyableId id={row.original.id} />
        </div>
      ),
    },
    {
      accessorKey: "purchaser_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Cliente / Studente</span>
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
        const b = row.original;
        const diffStudent = b.student_name && b.student_name !== b.purchaser_name;
        return (
          <div className="flex flex-col min-w-[180px] gap-0.5">
            <span className="font-medium text-sm text-foreground">{b.purchaser_name}</span>
            {diffStudent ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3 text-primary/70 shrink-0" />
                Studente: <strong className="font-semibold text-foreground/80">{b.student_name}</strong>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{b.purchaser_email}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Stato Pagamento</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.payment_status} />,
    },
    {
      accessorKey: "payment_method",
      header: "Metodo",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <PaymentMethodBadge method={row.original.payment_method} />
          {row.original.billing_scheme === "per_lesson" && (
            <Badge variant="secondary" className="text-[10px] text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-900/20 border border-violet-500/30 gap-1 w-fit">
              <Clock className="w-2.5 h-2.5" /> A Lezione
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "amount_paid",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Importo</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <CellCurrency amount={Number(row.original.amount_paid || 0)} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Data Ordine</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => <CellFormattedDate dateValue={row.original.created_at} />,
    },
    {
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onViewDetail(b)}
              title="Vedi Dettagli"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(b)}
              title="Modifica Ordine"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
              onClick={() => onDelete(b.id)}
              title="Elimina Ordine"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
