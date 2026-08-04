"use client"

import { useState, useMemo } from "react";
import { usePayments } from "../hooks/use-payments";
import { PaymentFormDialog } from "./payment-form-dialog";
import { PaymentDetailDialog } from "./payment-detail-dialog";
import { UniversalPosCheckoutModal } from "./universal-pos-checkout-modal";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  Trash2,
  ExternalLink,
  MoreVertical,
  ShoppingBag,
  ArrowRight,
  Shield,
  Calendar,
  Banknote,
  Building2,
} from "lucide-react";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
import type { Payment } from "../types";

export function getPaymentMethodBadge(method?: string) {
  const m = (method || "").toLowerCase();
  if (m === "cash" || m === "contanti") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[11px] font-medium shadow-2xs">
        <Banknote className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Contanti</span>
      </div>
    );
  }
  if (m === "pos" || m === "card" || m === "carta") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-[11px] font-medium shadow-2xs">
        <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Carta (POS)</span>
      </div>
    );
  }
  if (m === "stripe" || m === "online") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 text-[11px] font-medium shadow-2xs">
        <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <span>Stripe</span>
      </div>
    );
  }
  if (m === "transfer" || m === "bonifico") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-medium shadow-2xs">
        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Bonifico</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-muted-foreground border border-border/60 text-[11px] font-medium shadow-2xs">
      <CreditCard className="w-3.5 h-3.5 shrink-0" />
      <span className="capitalize">{method || "N/D"}</span>
    </div>
  );
}

export function PaymentsView() {
  const navigate = useNavigate();
  const { payments, loading, createPayment, updatePayment, deletePayment } = usePayments();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [posCheckoutOpen, setPosCheckoutOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return (
          <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-medium">
            Completato
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-medium">
            {status}
          </Badge>
        );
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const pMethod = p.paymentMethod || p.payment_method || "";
      const pTx = p.providerTransactionId || p.provider_transaction_id || "";

      if (q) {
        const matchId = (p.id || "").toLowerCase().includes(q);
        const matchTx = pTx.toLowerCase().includes(q);
        const matchNotes = (p.notes || "").toLowerCase().includes(q);
        const matchMethod = pMethod.toLowerCase().includes(q);
        if (!matchId && !matchTx && !matchNotes && !matchMethod) return false;
      }

      if (methodFilter !== "all" && pMethod !== methodFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;

      return true;
    });
  }, [payments, searchQuery, methodFilter, typeFilter]);

  const stats = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const stripeCount = payments.filter(
      (p) =>
        p.paymentMethod === "stripe" ||
        p.payment_method === "stripe" ||
        p.provider === "stripe",
    ).length;
    const manualCount = payments.filter(
      (p) =>
        p.paymentMethod === "cash" ||
        p.payment_method === "cash" ||
        p.paymentMethod === "pos" ||
        p.payment_method === "pos",
    ).length;
    const registrationCount = payments.filter((p) => p.type === "registration_fee").length;

    return {
      totalAmount,
      totalCount: payments.length,
      stripeCount,
      manualCount,
      registrationCount,
    };
  }, [payments]);

  const columns = useMemo<ColumnDef<Payment>[]>(
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
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "id",
        header: "ID Transazione",
        cell: ({ row }) => {
          const txId = row.original.providerTransactionId || row.original.provider_transaction_id;
          return (
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-foreground">
                #{row.original.id.slice(0, 8)}
              </span>
              {txId && (
                <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]">
                  {txId}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "bookingId",
        header: "Ordine / Riferimento",
        cell: ({ row }) => {
          const p = row.original;
          const bId = p.bookingId || p.booking_id;
          if (!bId) {
            const memId = (p as any).membershipId || (p as any).membership_id || p.notes?.match(/\[membership_id:(.+?)\]/)?.[1];
            const targetUrl = memId ? `/iscrizioni?highlight=${memId}` : `/iscrizioni`;

            return (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-mono gap-1.5 cursor-pointer hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border-amber-500/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(targetUrl);
                }}
                title="Vai al modulo Iscrizioni"
              >
                <Shield className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{memId ? `#${String(memId).slice(0, 8)}` : "Iscrizione Diretta"}</span>
                <ArrowRight className="w-3 h-3 shrink-0 opacity-60 ml-0.5" />
              </Button>
            );
          }
          return (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] font-mono gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/prenotazioni?id=${bId}`);
              }}
              title={`Vedi Ordine #${bId.slice(0, 8)}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>#{bId.slice(0, 8)}</span>
              <ArrowRight className="w-3 h-3 shrink-0 opacity-60 ml-0.5" />
            </Button>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium text-xs">
            {row.original.type === "registration_fee" ? "Quota Iscrizione" : "Pagamento Corso"}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Metodo",
        cell: ({ row }) => getPaymentMethodBadge(row.original.paymentMethod || row.original.payment_method),
      },
      {
        accessorKey: "status",
        header: "Stato",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "amount",
        header: "Importo",
        cell: ({ row }) => (
          <span className="font-bold text-sm text-foreground font-mono">
            €{Number(row.original.amount || 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Data",
        cell: ({ row }) => {
          const dateVal = row.original.createdAt || row.original.created_at;
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
          const p = row.original;
          const txId = p.providerTransactionId || p.provider_transaction_id;
          const bId = p.bookingId || p.booking_id;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedPayment(p)}
                title="Vedi Dettagli"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {bId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => navigate(`/prenotazioni?id=${bId}`)}
                  title={`Vedi Ordine #${bId.slice(0, 8)}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              )}
              {txId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
                  onClick={() => window.open(`https://dashboard.stripe.com/payments/${txId}`, "_blank")}
                  title="Apri in Stripe"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => setDeletingPaymentId(p.id)}
                title="Elimina Transazione"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [deletePayment, navigate],
  );


  const table = useReactTable({
    data: filteredPayments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const metrics = [
    {
      title: "Incasso Totale",
      value: `€${stats.totalAmount.toFixed(2)}`,
      description: `${stats.totalCount} transazioni complessive`,
      icon: Receipt,
    },
    {
      title: "Transazioni Stripe",
      value: stats.stripeCount,
      description: "Pagamenti completati via carte/web",
      icon: CheckCircle2,
    },
    {
      title: "Pagamenti in Sede",
      value: stats.manualCount,
      description: "Incassi in contanti e POS",
      icon: CreditCard,
    },
    {
      title: "Quote Iscrizione",
      value: stats.registrationCount,
      description: "Tessere associative annue",
      icon: Clock,
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

      {/* Main Table */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per ID, note, metodo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="Metodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i metodi</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="cash">Contanti</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="payment">Pagamento Corso</SelectItem>
                <SelectItem value="registration_fee">Quota Iscrizione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPosCheckoutOpen(true)}
              className="cursor-pointer font-bold text-xs bg-primary text-primary-foreground shadow-2xs"
            >
              <Receipt className="mr-1.5 h-4 w-4" />
              Nuovo Incasso (Касса POS)
            </Button>
          </div>
        </div>

        {/* Table */}
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPayment(row.original)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      Nessun pagamento trovato.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <DataTablePagination table={table} />
        </div>
      </div>

      {/* Payment Detail Modal */}
      <PaymentDetailDialog
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingPaymentId}
        onOpenChange={(v) => !v && setDeletingPaymentId(null)}
        title="Elimina Transazione"
        description="Sei sicuro di voler eliminare questa transazione? L'operazione non può essere annullata."
        onConfirm={async () => {
          if (deletingPaymentId) {
            await deletePayment(deletingPaymentId);
            setDeletingPaymentId(null);
          }
        }}
      />

      {/* Universal POS Cashier Modal */}
      <UniversalPosCheckoutModal
        open={posCheckoutOpen}
        onOpenChange={setPosCheckoutOpen}
      />
    </div>
  );
}
