"use client"

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useBookings } from "../hooks/use-bookings";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { BookingCard } from "./booking-card";
import { EditBookingDialog } from "./edit-booking-dialog";
import { CreateBookingDialog } from "./create-booking-dialog";
import { getPaymentMethodBadge } from "@/features/payments/components/payments-view";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  ShoppingBag,
  Store,
  CircleDashed,
  CheckCircle2,
  Search,
  LayoutGrid,
  List,
  Eye,
  Trash2,
  AlertCircle,
  Clock,
  ChevronDown,
  Pencil,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Booking } from "../types/booking";

export function BookingsView() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");

  const {
    bookings,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedBooking,
    setSelectedBooking,
    updateBookingStatus,
    deleteBooking,
    createManualBooking,
  } = useBookings();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  useEffect(() => {
    if (targetId && bookings.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`booking-row-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [targetId, bookings]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID ordine copiato!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStatusBadge = (b: Booking) => {
    const isPaid = b.payment_status === "completed" || b.payment_status === "paid" || b.payment_status === "succeeded";
    const isPartiallyPaid = b.payment_status === "partially_paid";
    const isOverdue = b.payment_status === "overdue" || b.payment_status === "scaduto";

    if (isPaid) {
      return (
        <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          Pagato
        </Badge>
      );
    }
    if (isPartiallyPaid) {
      return (
        <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          Parziale
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge variant="secondary" className="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30 shadow-2xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          In Debito
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20 font-semibold gap-1.5 border border-sky-500/30 shadow-2xs">
        <AlertCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        Da Saldare in Sede
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
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
            <button
              type="button"
              onClick={(e) => handleCopyId(e, row.original.id)}
              className="inline-flex items-center gap-1 w-fit text-[11px] text-muted-foreground font-mono hover:text-primary transition-colors cursor-pointer"
              title="Clicca per copiare l'ID"
            >
              {copiedId === row.original.id ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3 opacity-60" />
              )}
              <span>#{row.original.id.slice(0, 8)}</span>
            </button>
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
        cell: ({ row }) => renderStatusBadge(row.original),
      },
      {
        accessorKey: "payment_method",
        header: "Metodo",
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            {getPaymentMethodBadge(row.original.payment_method)}
            {row.original.billing_scheme === 'per_lesson' && (
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
        cell: ({ row }) => (
          <span className="font-bold text-sm text-foreground font-mono">
            €{Number(row.original.amount_paid || 0).toFixed(2)}
          </span>
        ),
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
        cell: ({ row }) => {
          const dateVal = row.original.created_at;
          if (!dateVal) return <span className="text-xs text-muted-foreground">—</span>;
          const d = new Date(dateVal);
          const dateStr = d.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const timeStr = d.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 dark:bg-muted/30 border border-border/60 text-[11px] font-mono font-medium text-foreground shadow-2xs">
              <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
              <span>{dateStr}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-primary font-semibold">{timeStr}</span>
            </div>
          );
        },
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
                onClick={() => setSelectedBooking(b)}
                title="Vedi Dettagli"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setEditingBooking(b)}
                title="Modifica Ordine"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => setDeletingBookingId(b.id)}
                title="Elimina Ordine"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [setSelectedBooking, updateBookingStatus, deleteBooking, copiedId],
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const metrics = [
    {
      title: "Totale Ordini",
      value: stats.totalCount,
      description: "Ordini registrati a sistema",
      icon: ShoppingBag,
    },
    {
      title: "Pagati Online",
      value: stats.paidCount,
      description: "Pagamenti completati via Stripe",
      icon: CheckCircle2,
    },
    {
      title: "Da Saldare in Sede",
      value: stats.reservedCount,
      description: "Prenotazioni da saldare alla scuola",
      icon: Store,
    },
    {
      title: "In Coordinamento",
      value: stats.leadsCount,
      description: "Richieste in attesa di orario",
      icon: CircleDashed,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stat Cards */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="border">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <metric.icon className="text-muted-foreground size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-muted-foreground text-xs">{metric.description}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Table / Grid Content */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca cliente, studente, corso, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Stato Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="completed">Pagati Online</SelectItem>
                <SelectItem value="reserved">Da Saldare in Sede</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <CreateBookingDialog onCreateBooking={createManualBooking} />
            {/* View Toggle Buttons */}
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-2.5 cursor-pointer"
              >
                <List className="h-4 w-4 mr-1" />
                <span>Tabella</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2.5 cursor-pointer"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span>Griglia</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Views */}
        {viewMode === "table" ? (
          <div className="space-y-4">
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const b = row.original;
                      const isTarget = Boolean(
                        targetId &&
                          (b.id === targetId ||
                            b.id.startsWith(targetId) ||
                            targetId.startsWith(b.id) ||
                            (targetId.length >= 6 && b.id.toLowerCase().includes(targetId.toLowerCase())))
                      );
                      return (
                        <TableRow
                          key={row.id}
                          id={`booking-row-${b.id}`}
                          className={`transition-all duration-300 ${
                            isTarget
                              ? "font-bold ring-2 ring-primary/70 shadow-lg"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {row.getVisibleCells().map((cell, idx) => (
                            <TableCell
                              key={cell.id}
                              className={
                                isTarget
                                  ? `bg-primary/20 dark:bg-primary/30 text-foreground font-bold ${
                                      idx === 0 ? "border-l-4 border-l-primary" : ""
                                    }`
                                  : undefined
                              }
                              onClick={(e) => {
                                if (cell.column.id === "actions" || cell.column.id === "select" || cell.column.id === "payment_status") {
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        Nessun ordine trovato.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            <DataTablePagination table={table} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {bookings.map((booking) => {
              const isTarget =
                targetId && (booking.id === targetId || booking.id.startsWith(targetId));
              return (
                <div
                  key={booking.id}
                  className={
                    isTarget
                      ? "ring-2 ring-primary ring-offset-2 rounded-xl shadow-lg transition-all duration-300"
                      : ""
                  }
                >
                  <BookingCard
                    booking={booking}
                    onSelect={setSelectedBooking}
                    onDelete={deleteBooking}
                    onToggleStatus={updateBookingStatus}
                  />
                </div>
              );
            })}

            {bookings.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground border rounded-md">
                Nessun ordine trovato.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailDialog
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={(id, status) => updateBookingStatus(id, status)}
        onDelete={deleteBooking}
      />

      {/* Booking Edit Modal */}
      <EditBookingDialog
        booking={editingBooking}
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
        onSuccess={createManualBooking}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingBookingId}
        onOpenChange={(v) => !v && setDeletingBookingId(null)}
        title="Elimina Ordine"
        description="Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata."
        onConfirm={async () => {
          if (deletingBookingId) {
            await deleteBooking(deletingBookingId);
            setDeletingBookingId(null);
          }
        }}
      />
    </div>
  );
}
