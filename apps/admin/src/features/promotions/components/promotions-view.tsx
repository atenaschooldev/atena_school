import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, Tag, Percent, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePromoCodes } from "../hooks/use-promo-codes";
import { getPromoCodesTableColumns } from "./promo-codes-table-columns";
import { CreatePromoDialog } from "./create-promo-dialog";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { PromoCodeItem, CreatePromoCodeInput } from "../types";

export function PromotionsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoCodeItem | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  const {
    promoCodes,
    loading,
    createPromoCode,
    updatePromoCode,
    togglePromoCode,
    deletePromoCode,
  } = usePromoCodes({
    search: debouncedSearch,
    status: statusFilter,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "code", desc: false },
  ]);

  const handleEdit = (item: PromoCodeItem) => {
    setEditingItem(item);
    setCreateDialogOpen(true);
  };

  const handleCreateOrUpdate = async (data: CreatePromoCodeInput) => {
    if (editingItem) {
      await updatePromoCode(editingItem.id, data);
    } else {
      await createPromoCode(data);
    }
  };

  const columns = useMemo(
    () =>
      getPromoCodesTableColumns({
        onEdit: handleEdit,
        onDelete: deletePromoCode,
        onToggleStatus: togglePromoCode,
      }),
    [deletePromoCode, togglePromoCode]
  );

  const table = useReactTable({
    data: promoCodes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = useMemo(() => {
    const total = promoCodes.length;
    const active = promoCodes.filter((p) => p.is_active).length;
    const totalUses = promoCodes.reduce((acc, p) => acc + (p.used_count || 0), 0);
    return { total, active, totalUses };
  }, [promoCodes]);

  const metrics = [
    {
      title: "Totale Codici Promo",
      value: stats.total,
      description: "Codici creati nel sistema",
      icon: Tag,
    },
    {
      title: "Codici Attivi",
      value: stats.active,
      description: "Attualmente utilizzabili",
      icon: CheckCircle2,
    },
    {
      title: "Utilizzi Totali",
      value: stats.totalUses,
      description: "Applicati nelle iscrizioni",
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Metric summary banner */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cerca codice o descrizione..."
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: "Stato",
              options: [
                { value: "all", label: "Tutti gli stati" },
                { value: "active", label: "Solo Attivi" },
                { value: "inactive", label: "Solo Disattivi" },
              ],
            },
          ]}
          actionElement={
            <Button
              onClick={() => {
                setEditingItem(null);
                setCreateDialogOpen(true);
              }}
              className="font-medium cursor-pointer shadow-sm text-xs"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nuovo Codice Promo
            </Button>
          }
        />

        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows columnsCount={columns.length} rowCount={5} />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-all duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground text-xs font-medium"
                  >
                    Nessun codice promozionale trovato.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      <CreatePromoDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
      />
    </div>
  );
}
