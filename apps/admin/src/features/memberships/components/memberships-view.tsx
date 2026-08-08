import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemberships } from "../hooks/use-memberships";
import { MembershipsMetrics } from "./memberships-metrics";
import { getMembershipsTableColumns } from "./memberships-table-columns";
import { CreateMembershipDialog } from "./create-membership-dialog";
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

export function MembershipsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(q), 300);
  }, []);

  useEffect(() => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }, []);

  const { memberships, stats, loading, toggleStatus, refresh } = useMemberships({
    status: statusFilter,
    academicYear: academicYearFilter,
    search: debouncedSearch,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const columns = useMemo(
    () =>
      getMembershipsTableColumns({
        onToggleStatus: async (id) => {
          await toggleStatus(id);
        },
      }),
    [toggleStatus]
  );

  const table = useReactTable({
    data: memberships,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <MembershipsMetrics stats={stats} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Cerca socio per nome, email, CF..."
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: "Stato Tessera",
              options: [
                { value: "all", label: "Tutti gli stati" },
                { value: "active", label: "Attiva" },
                { value: "pending", label: "In Attesa" },
                { value: "expired", label: "Scaduta" },
                { value: "revoked", label: "Revocata" },
              ],
            },
            {
              value: academicYearFilter,
              onChange: setAcademicYearFilter,
              placeholder: "Anno Accademico",
              options: [
                { value: "all", label: "Tutti gli anni" },
                { value: "2025/2026", label: "2025/2026" },
                { value: "2024/2025", label: "2024/2025" },
              ],
            },
          ]}
          actionElement={
            <Button onClick={() => setCreateDialogOpen(true)} className="font-medium cursor-pointer shadow-sm text-xs">
              <Plus className="mr-1.5 h-4 w-4" /> Registra Nuova Tessera €30
            </Button>
          }
        />

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
                    <TableRow key={row.id} className="hover:bg-muted/50 transition-all duration-200">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      Nessuna tessera trovata.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      <CreateMembershipDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
