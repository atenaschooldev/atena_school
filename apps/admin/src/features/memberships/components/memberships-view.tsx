"use client";

import { useState, useMemo, useEffect } from "react";
import { useMemberships } from "../hooks/use-memberships";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BadgeCheck,
  XCircle,
  Clock,
  Search,
  Users,
  ExternalLink,
  Shield,
  ShieldOff,
  Calendar,
  Building2,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
} from "lucide-react";
import { UniversalPosCheckoutModal } from "@/features/payments/components/universal-pos-checkout-modal";
import { CreateMembershipDialog } from "./create-membership-dialog";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { Membership } from "../types";

function getStatusBadge(status: string, expiresAt: string) {
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  if (status === "active") {
    if (isExpired) {
      return (
        <Badge variant="secondary" className="gap-1.5 bg-muted text-muted-foreground border-border w-fit font-medium">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Scaduta
        </Badge>
      );
    }
    return (
      <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-semibold w-fit">
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        Attiva
      </Badge>
    );
  }

  if (status === "pending" || status === "in_attesa") {
    return (
      <Badge variant="secondary" className="gap-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold w-fit">
        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        In attesa
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-1.5 font-semibold w-fit">
      <XCircle className="h-3.5 w-3.5 shrink-0" />
      Revocata
    </Badge>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MembershipsView() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "paidAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [feeCheckoutOpen, setFeeCheckoutOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { memberships, loading, updateStatus, refresh } = useMemberships({
    status: statusFilter,
    academicYear: yearFilter,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight") || searchParams.get("id");

  useEffect(() => {
    if (highlightId && memberships.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`membership-row-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [highlightId, memberships]);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID iscrizione copiato!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = useMemo(() => {
    const total = memberships.length;
    const active = memberships.filter((m) => {
      const isExpired = new Date(m.expiresAt) < new Date();
      return m.status === "active" && !isExpired;
    }).length;
    const revoked = memberships.filter((m) => m.status === "revoked").length;
    const expired = memberships.filter((m) => {
      const isExpired = new Date(m.expiresAt) < new Date();
      return m.status === "active" && isExpired;
    }).length;
    return { total, active, revoked, expired };
  }, [memberships]);

  const columns: ColumnDef<Membership>[] = [
    {
      id: "taxCode",
      accessorKey: "taxCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Codice Fiscale / Email</span>
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
        const m = row.original;
        return (
          <div className="flex flex-col gap-0.5 min-w-[200px]">
            <span className="font-bold text-sm text-foreground font-mono tracking-wide">
              {m.taxCode || "NON SPECIFICATO"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleCopyId(e, m.id)}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono hover:text-primary transition-colors cursor-pointer shrink-0"
                title="Clicca per copiare l'ID"
              >
                {copiedId === m.id ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 opacity-60" />
                )}
                <span>#{m.id.slice(0, 8)}</span>
              </button>
              {m.email && (
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  • {m.email}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Anno</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-xs w-fit">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      id: "status",
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
      cell: ({ row }) => getStatusBadge(row.original.status, row.original.expiresAt),
    },
    {
      id: "paidAt",
      accessorKey: "paidAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Pagata il</span>
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
        if (!row.original.paidAt) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 dark:bg-muted/30 border border-border/60 text-[11px] font-mono font-medium text-foreground shadow-2xs">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>{formatDate(row.original.paidAt)}</span>
          </div>
        );
      },
    },
    {
      id: "expiresAt",
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Scade il</span>
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
        const expiresDate = new Date(row.original.expiresAt);
        const now = new Date();
        const isExpired = expiresDate < now;
        const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const isExpiringSoon = !isExpired && daysLeft <= 30;

        if (isExpired) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium shadow-2xs bg-destructive/10 text-destructive border-destructive/30 w-fit">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Scaduta ({formatDate(row.original.expiresAt)})</span>
            </div>
          );
        }
        if (isExpiringSoon) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium shadow-2xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 w-fit">
              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Scade il {formatDate(row.original.expiresAt)}</span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium shadow-2xs bg-muted/60 dark:bg-muted/30 border-border/60 text-foreground w-fit">
            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>Fino al {formatDate(row.original.expiresAt)}</span>
          </div>
        );
      },
    },
    {
      id: "booking",
      header: "Prenotazione",
      cell: ({ row }) => {
        const m = row.original;
        if (!m.bookingId) {
          return (
            <Badge variant="outline" className="text-[11px] font-medium text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-500/25 gap-1.5 shadow-2xs w-fit">
              <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
              <span>In Sede (Scuola)</span>
            </Badge>
          );
        }
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-[11px] font-mono gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors border-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/prenotazioni?highlight=${m.bookingId}`);
            }}
            title={`Vedi Prenotazione #${m.bookingId.slice(0, 8)}`}
          >
            <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Online #{m.bookingId.slice(0, 8)}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-60 ml-0.5" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      header: "Azioni",
      enableHiding: false,
      cell: ({ row }) => {
        const m = row.original;
        const isActive = m.status === "active";
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 text-xs font-medium cursor-pointer transition-colors gap-1.5 ${
                isActive
                  ? "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400"
                  : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:text-emerald-400"
              }`}
              onClick={() => updateStatus(m.id, isActive ? "revoked" : "active")}
              title={isActive ? "Revoca iscrizione annuale" : "Riattiva iscrizione annuale"}
            >
              {isActive ? (
                <>
                  <ShieldOff className="h-3.5 w-3.5" />
                  <span>Revoca</span>
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  <span>Riattiva</span>
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: memberships,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Iscrizioni Annuali</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestione quote di iscrizione per anno accademico
          </p>
        </div>
        <CreateMembershipDialog onSuccess={() => refresh()} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Totale</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attive</p>
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scadute</p>
              <p className="text-xl font-bold text-amber-600">{stats.expired}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revocate</p>
              <p className="text-xl font-bold text-destructive">{stats.revoked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per email, codice fiscale..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="active">Attive</SelectItem>
              <SelectItem value="pending">In attesa</SelectItem>
              <SelectItem value="revoked">Revocate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Anno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli anni</SelectItem>
              <SelectItem value="2026/2027">2026/2027</SelectItem>
              <SelectItem value="2025/2026">2025/2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows columnsCount={columns.length} rowCount={6} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 opacity-30" />
                    <span>Nessuna iscrizione trovata</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const m = row.original;
                const isTarget = Boolean(
                  highlightId &&
                    (m.id === highlightId ||
                      m.id.startsWith(highlightId) ||
                      highlightId.startsWith(m.id) ||
                      (highlightId.length >= 6 && m.id.toLowerCase().includes(highlightId.toLowerCase())) ||
                      m.bookingId === highlightId)
                );
                return (
                  <TableRow
                    key={row.id}
                    id={`membership-row-${m.id}`}
                    className={
                      isTarget
                        ? "font-bold ring-2 ring-amber-500/70 shadow-lg transition-all duration-300"
                        : "hover:bg-muted/50"
                    }
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <TableCell
                        key={cell.id}
                        className={
                          isTarget
                            ? `bg-amber-500/25 dark:bg-amber-500/30 text-foreground font-bold ${
                                idx === 0 ? "border-l-4 border-l-amber-500" : ""
                              }`
                            : undefined
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Standalone Fee Checkout Modal */}
      <UniversalPosCheckoutModal
        open={feeCheckoutOpen}
        onOpenChange={setFeeCheckoutOpen}
        defaultFeeOnly={true}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
