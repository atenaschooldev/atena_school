"use client"

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBookings } from "../hooks/use-bookings";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { BookingCard } from "./booking-card";
import { CreateBookingDialog } from "./create-booking-dialog";
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
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ColumnDef,
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

  useEffect(() => {
    if (targetId && bookings.length > 0) {
      const match = bookings.find((b) => b.id === targetId || b.id.startsWith(targetId));
      if (match) {
        setSelectedBooking(match);
      }
    }
  }, [targetId, bookings, setSelectedBooking]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return (
          <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-medium">
            Pagato Online
          </Badge>
        );
      case "reserved":
        return (
          <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-medium">
            Da Saldare in Sede
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20 font-medium">
            In Coordinamento
          </Badge>
        );
    }
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
        header: "Corso / Servizio",
        cell: ({ row }) => (
          <div className="flex flex-col min-w-[180px]">
            <span className="font-medium text-sm text-foreground">{row.original.course_name}</span>
            <span className="text-xs text-muted-foreground font-mono">#{row.original.id.slice(0, 8)}</span>
          </div>
        ),
      },
      {
        accessorKey: "purchaser_name",
        header: "Cliente / Studente",
        cell: ({ row }) => {
          const b = row.original;
          const diffStudent = b.student_name && b.student_name !== b.purchaser_name;
          return (
            <div className="flex flex-col min-w-[180px]">
              <span className="font-medium text-sm text-foreground">{b.purchaser_name}</span>
              {diffStudent ? (
                <span className="text-xs text-muted-foreground">Studente: {b.student_name}</span>
              ) : (
                <span className="text-xs text-muted-foreground">{b.purchaser_email}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Stato Pagamento",
        cell: ({ row }) => getStatusBadge(row.original.payment_status),
      },
      {
        accessorKey: "payment_method",
        header: "Metodo",
        cell: ({ row }) => (
          <span className="text-xs font-medium capitalize text-muted-foreground">
            {row.original.payment_method || "In sede"}
          </span>
        ),
      },
      {
        accessorKey: "amount_paid",
        header: "Importo",
        cell: ({ row }) => (
          <span className="font-bold text-sm text-foreground">
            €{Number(row.original.amount_paid || 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Data Ordine",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Azioni",
        cell: ({ row }) => {
          const b = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Opzioni</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedBooking(b)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Vedi Dettagli
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    updateBookingStatus(
                      b.id,
                      b.payment_status === "completed" || b.payment_status === "paid"
                        ? "reserved"
                        : "completed",
                    )
                  }
                >
                  {b.payment_status === "completed" || b.payment_status === "paid" ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                      Segna Da Saldare
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                      Segna Come Pagato
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => deleteBooking(b.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina Ordine
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [setSelectedBooking, updateBookingStatus, deleteBooking],
  );

  const table = useReactTable({
    data: bookings,
    columns,
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

            <CreateBookingDialog onCreateBooking={createManualBooking} />
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
                      const isTarget =
                        targetId &&
                        (row.original.id === targetId || row.original.id.startsWith(targetId));
                      return (
                        <TableRow
                          key={row.id}
                          className={`cursor-pointer transition-all duration-300 ${
                            isTarget
                              ? "bg-primary/15 dark:bg-primary/25 border-l-4 border-l-primary font-medium ring-1 ring-primary/40 shadow-sm"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedBooking(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              onClick={(e) => {
                                if (cell.column.id === "actions" || cell.column.id === "select") {
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
            <div className="flex items-center justify-between space-x-2 py-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="page-size" className="text-sm font-medium">
                  Mostra
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="w-20 cursor-pointer" id="page-size">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
                {table.getFilteredSelectedRowModel().rows.length} di{" "}
                {table.getFilteredRowModel().rows.length} selezionati.
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer"
                >
                  Indietro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer"
                >
                  Avanti
                </Button>
              </div>
            </div>
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
    </div>
  );
}
