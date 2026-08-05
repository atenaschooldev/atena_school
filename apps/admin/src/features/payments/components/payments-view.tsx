"use client"

import { useState, useMemo } from "react";
import { usePayments } from "../hooks/use-payments";
import { PaymentFormDialog } from "./payment-form-dialog";
import { PaymentDetailDialog } from "./payment-detail-dialog";
import { UniversalPosCheckoutModal } from "./universal-pos-checkout-modal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  Trash2,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Shield,
  Calendar,
  Banknote,
  Building2,
  Plus,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
  type ColumnDef,
  type SortingState,
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
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[11px] font-medium shadow-2xs w-fit">
        <Banknote className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>Contanti</span>
      </div>
    );
  }
  if (m === "pos" || m === "card" || m === "carta") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-[11px] font-medium shadow-2xs w-fit">
        <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Carta (POS)</span>
      </div>
    );
  }
  if (m === "stripe" || m === "online") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 text-[11px] font-medium shadow-2xs w-fit">
        <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <span>Stripe</span>
      </div>
    );
  }
  if (m === "transfer" || m === "bonifico") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-medium shadow-2xs w-fit">
        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Bonifico</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 text-muted-foreground border border-border/60 text-[11px] font-medium shadow-2xs w-fit">
      <CreditCard className="w-3.5 h-3.5 shrink-0" />
      <span className="capitalize">{method || "N/D"}</span>
    </div>
  );
}

export function PaymentsView() {
  const navigate = useNavigate();
  const { payments, summary, loading, createPayment, updatePayment, deletePayment } = usePayments();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [posCheckoutOpen, setPosCheckoutOpen] = useState(false);
  const [feeCheckoutOpen, setFeeCheckoutOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID transazione copiato!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPaymentStatusPill = (p: Payment) => {
    const st = (p.status || "pending").toLowerCase();
    const isSucceeded = st === "succeeded" || st === "paid";
    const isFailed = st === "failed" || st === "cancelled" || st === "rimborsato";

    let badgeElement;
    if (isSucceeded) {
      badgeElement = (
        <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 shadow-2xs cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          Accreditato / Pagato
          <ChevronDown className="w-3 h-3 text-emerald-500/70 ml-0.5 shrink-0" />
        </Badge>
      );
    } else if (isFailed) {
      badgeElement = (
        <Badge variant="secondary" className="text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30 shadow-2xs cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          Annullato / Rimborsato
          <ChevronDown className="w-3 h-3 text-rose-500/70 ml-0.5 shrink-0" />
        </Badge>
      );
    } else {
      badgeElement = (
        <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30 shadow-2xs cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          In attesa / Sospeso
          <ChevronDown className="w-3 h-3 text-amber-500/70 ml-0.5 shrink-0" />
        </Badge>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          {badgeElement}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 shadow-lg">
          <DropdownMenuItem
            className="cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              updatePayment({ id: p.id, status: "succeeded" });
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="text-emerald-600 dark:text-emerald-400">Accreditato / Pagato</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              updatePayment({ id: p.id, status: "pending" });
            }}
          >
            <Clock className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-amber-600 dark:text-amber-400">In attesa / Sospeso</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer font-medium text-rose-600 focus:text-rose-600"
            onClick={(e) => {
              e.stopPropagation();
              updatePayment({ id: p.id, status: "cancelled" });
            }}
          >
            <AlertCircle className="w-4 h-4 text-rose-500 mr-2" />
            <span className="text-rose-600 dark:text-rose-400">Annullato / Rimborsato</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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

  const metrics = useMemo(() => [
    {
      title: "Cassa Oggi (Contanti)",
      value: summary ? `€${Number(summary.todayCash || 0).toFixed(2)}` : "€0.00",
      description: `POS: €${Number(summary?.todayPos || 0).toFixed(2)} | Bonifico: €${Number(summary?.todayTransfer || 0).toFixed(2)}`,
      icon: Banknote,
    },
    {
      title: "Incasso Oggi Totale",
      value: summary ? `€${Number(summary.todayTotal || 0).toFixed(2)}` : "€0.00",
      description: "Totale incassi di oggi",
      icon: Receipt,
    },
    {
      title: "Incasso Totale Complessivo",
      value: `€${stats.totalAmount.toFixed(2)}`,
      description: `${stats.totalCount} transazioni a sistema`,
      icon: CheckCircle2,
    },
    {
      title: "Quote Iscrizione (€30)",
      value: stats.registrationCount,
      description: "Quote iscrizione registrate",
      icon: Clock,
    },
  ], [stats, summary]);

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
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>ID Transazione</span>
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
          const txId = row.original.providerTransactionId || row.original.provider_transaction_id;
          return (
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => handleCopyId(e, row.original.id)}
                className="inline-flex items-center gap-1 w-fit text-xs font-mono font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                title="Clicca per copiare l'ID"
              >
                {copiedId === row.original.id ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 opacity-60" />
                )}
                <span>#{row.original.id.slice(0, 8)}</span>
              </button>
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
          const memId = (p as any).membershipId || (p as any).membership_id || p.notes?.match(/\[membership_id:(.+?)\]/)?.[1];
          const customerLabel = p.booking?.purchaserName || p.student?.full_name || (p.student?.first_name ? `${p.student.first_name} ${p.student.last_name || ""}` : null) || p.booking?.purchaserEmail || p.student?.email || p.student?.tax_code;
          const courseLabel = p.booking?.courseName;

          if (!bId) {
            const targetUrl = memId ? `/iscrizioni?highlight=${memId}` : `/iscrizioni`;

            return (
              <div className="flex flex-col gap-1 items-start min-w-[140px]">
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
                {customerLabel && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                    {customerLabel}
                  </span>
                )}
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-1 items-start min-w-[140px]">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-mono gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
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
              {(customerLabel || courseLabel) && (
                <span className="text-[11px] text-muted-foreground truncate max-w-[170px]" title={customerLabel || courseLabel}>
                  {customerLabel || courseLabel}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Tipo</span>
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
          <Badge variant="outline" className="font-medium text-xs w-fit">
            {row.original.type === "registration_fee" ? "Quota Iscrizione" : "Pagamento Corso"}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Metodo</span>
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
          <div className="flex flex-col items-start gap-1">
            {getPaymentMethodBadge(row.original.paymentMethod || row.original.payment_method)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Stato</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => renderPaymentStatusPill(row.original),
      },
      {
        accessorKey: "amount",
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
            €{Number(row.original.amount || 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Data</span>
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

          return (
            <div className="flex items-center gap-1.5">
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
                size="sm"
                className="h-7 px-2.5 text-xs text-rose-600/80 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 font-medium cursor-pointer gap-1.5 transition-colors"
                onClick={() => setDeletingPaymentId(p.id)}
                title="Elimina Transazione"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Elimina</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [deletePayment, navigate, copiedId],
  );

  const table = useReactTable({
    data: filteredPayments,
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
                placeholder="Cerca per ID, studente, note, metodo..."
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
                <SelectItem value="stripe">Stripe Online</SelectItem>
                <SelectItem value="cash">Contanti</SelectItem>
                <SelectItem value="pos">POS / Carta</SelectItem>
                <SelectItem value="transfer">Bonifico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="course_payment">Pagamento Corso</SelectItem>
                <SelectItem value="registration_fee">Quota Iscrizione (€30)</SelectItem>
                <SelectItem value="exam_fee">Esame</SelectItem>
                <SelectItem value="certificate_fee">Certificato</SelectItem>
                <SelectItem value="textbook_material">Libri / Materiale</SelectItem>
                <SelectItem value="single_lesson">Lezione Singola</SelectItem>
                <SelectItem value="other">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPosCheckoutOpen(true)}
              className="cursor-pointer font-bold text-xs bg-primary text-primary-foreground shadow-2xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Incasso</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setFeeCheckoutOpen(true)}
              className="cursor-pointer font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 shadow-2xs gap-1.5"
            >
              <Receipt className="h-4 w-4 text-amber-500" />
              <span>+ Quota Iscrizione €30</span>
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

      {/* Standalone Registration Fee (€30) Modal */}
      <UniversalPosCheckoutModal
        open={feeCheckoutOpen}
        onOpenChange={setFeeCheckoutOpen}
        defaultFeeOnly={true}
      />
    </div>
  );
}
