import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, BadgeCheck, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemberships } from "../hooks/use-memberships";
import { MembershipsMetrics } from "./memberships-metrics";
import { getMembershipsTableColumns } from "./memberships-table-columns";
import { CreateMembershipDialog } from "./create-membership-dialog";
import { RegistrationFeeSettingsCard } from "@/components/shared/registration-fee-settings-card";
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
import { useTranslation } from "@/i18n/context";

export function MembershipsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"registry" | "settings">("registry");
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
        t,
      }),
    [toggleStatus, t]
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
    <div className="flex flex-col gap-6">
      {/* ── Sub-Navigation Tabs ── */}
      <div className="@container/main px-4 lg:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex rounded-xl bg-muted/50 p-1 border flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("registry")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "registry"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              {t("memberships.tabRegistry") || "Registro Soci & Tessere"} ({memberships.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-4 w-4 text-primary" />
              {t("memberships.tabSettings") || "Configurazione Quota"}
            </button>
          </div>
        </div>
      </div>

      {activeTab === "settings" ? (
        <div className="@container/main px-4 lg:px-6">
          <RegistrationFeeSettingsCard />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <MembershipsMetrics stats={stats} />

          <div className="@container/main px-4 lg:px-6 space-y-4">
            <DataViewToolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder={t("memberships.searchMember")}
              filters={[
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  placeholder: t("memberships.cardStatus"),
                  options: [
                    { value: "all", label: t("common.all") },
                    { value: "active", label: t("common.active") },
                    { value: "pending", label: t("common.pending") },
                    { value: "expired", label: t("memberships.membershipExpired") },
                  ],
                },
                {
                  value: academicYearFilter,
                  onChange: setAcademicYearFilter,
                  placeholder: t("memberships.academicYear"),
                  options: [
                    { value: "all", label: t("common.all") },
                    { value: "2026/2027", label: "2026/2027" },
                    { value: "2025/2026", label: "2025/2026" },
                  ],
                },
              ]}
              actionElement={
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="cursor-pointer font-medium text-xs shadow-sm"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> {t("memberships.addMembership")}
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
      )}
    </div>
  );
}
