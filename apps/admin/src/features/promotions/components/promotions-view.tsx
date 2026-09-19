import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, Tag, Percent, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col gap-4">
      {/* Metric summary banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 lg:px-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Totale Codici Promo
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Codici Attivi
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              {stats.active}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Utilizzi Totali nei Corsi
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {stats.totalUses}
            </span>
          </div>
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
              size="sm"
              className="gap-1.5 font-bold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nuovo Codice Promo
            </Button>
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-slate-50/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
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
                <TableSkeletonRows columns={6} rows={5} />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50/60 transition-colors"
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
                    className="h-32 text-center text-slate-400 text-xs font-medium"
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
