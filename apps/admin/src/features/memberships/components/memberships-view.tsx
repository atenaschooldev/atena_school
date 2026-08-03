"use client";

import { useState, useMemo } from "react";
import { useMemberships } from "../hooks/use-memberships";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  XCircle,
  Clock,
  Search,
  Users,
  ExternalLink,
  Shield,
  ShieldOff,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const isExpired = new Date(expiresAt) < new Date();
  if (isExpired && status === "active") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Scaduta
      </Badge>
    );
  }
  if (status === "active") {
    return (
      <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
        <BadgeCheck className="h-3 w-3" />
        Attiva
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" />
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { memberships, loading, updateStatus } = useMemberships({
    status: statusFilter,
    academicYear: yearFilter,
  });

  const navigate = useNavigate();

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
      id: "email",
      header: "Email / Studente",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{m.email || "—"}</span>
            {m.taxCode && (
              <span className="text-xs text-muted-foreground font-mono">{m.taxCode}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "academicYear",
      header: "Anno",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Stato",
      cell: ({ row }) => getStatusBadge(row.original.status, row.original.expiresAt),
    },
    {
      id: "paidAt",
      header: "Pagata il",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.paidAt)}</span>
      ),
    },
    {
      id: "expiresAt",
      header: "Scade il",
      cell: ({ row }) => {
        const isExpired = new Date(row.original.expiresAt) < new Date();
        return (
          <span className={`text-sm ${isExpired ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {formatDate(row.original.expiresAt)}
          </span>
        );
      },
    },
    {
      id: "booking",
      header: "Prenotazione",
      cell: ({ row }) => {
        const m = row.original;
        if (!m.bookingId) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/prenotazioni?highlight=${m.bookingId}`);
            }}
          >
            <ExternalLink className="h-3 w-3" />
            Vai
          </Button>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const m = row.original;
        const isActive = m.status === "active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {m.bookingId && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate(`/prenotazioni?highlight=${m.bookingId}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Vai alla prenotazione
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isActive ? (
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => updateStatus(m.id, "revoked")}
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Revoca iscrizione
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                  onClick={() => updateStatus(m.id, "active")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Riattiva iscrizione
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} iscrizioni
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Indietro
            </Button>
            <span className="text-sm text-muted-foreground">
              Pag. {table.getState().pagination.pageIndex + 1} di {table.getPageCount() || 1}
            </span>
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
    </div>
  );
}
