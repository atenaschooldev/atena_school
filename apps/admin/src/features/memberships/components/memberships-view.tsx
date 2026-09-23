"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Plus, BadgeCheck, Sliders, Award, RotateCcw } from "lucide-react";
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
import { useSchoolProfile } from "@/hooks/use-school-profile";

export function MembershipsView() {
  const { t } = useTranslation();
  const { profile } = useSchoolProfile();
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

  // Dynamically derive unique academic years from data + school profile
  const academicYearOptions = useMemo(() => {
    const yearsSet = new Set<string>();
    if (profile?.academic_year) {
      yearsSet.add(profile.academic_year);
    }
    memberships.forEach((m) => {
      if (m.academicYear) yearsSet.add(m.academicYear);
    });

    const sortedYears = Array.from(yearsSet).sort().reverse();
    return [
      { value: "all", label: t("common.all") || "Tutti gli anni" },
      ...sortedYears.map((yr) => ({ value: yr, label: yr })),
    ];
  }, [memberships, profile?.academic_year, t]);

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
              searchPlaceholder={t("memberships.searchMember") || "Cerca per nome studente, CF o email..."}
              filters={[
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  placeholder: t("memberships.cardStatus") || "Stato Tessera",
                  options: [
                    { value: "all", label: t("common.all") || "Tutti gli stati" },
                    { value: "active", label: t("common.active") || "Attivo" },
                    { value: "pending", label: t("common.pending") || "In attesa" },
                    { value: "expired", label: t("memberships.membershipExpired") || "Scaduto" },
                  ],
                },
                {
                  value: academicYearFilter,
                  onChange: setAcademicYearFilter,
                  placeholder: t("memberships.academicYear") || "Anno Accademico",
                  options: academicYearOptions,
                },
              ]}
              actionElement={
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="cursor-pointer font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("memberships.addMembership") || "Registra Socio"}</span>
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
                        <TableCell colSpan={columns.length} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                            <div className="p-3 bg-muted/30 rounded-2xl border border-border/50 text-muted-foreground">
                              <Award className="w-8 h-8 opacity-70" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-foreground">
                                {t("memberships.emptyState.title") || "Nessun socio trovato"}
                              </h4>
                              <p className="text-xs text-muted-foreground max-w-sm">
                                {t("memberships.emptyState.description") ||
                                  "Non ci sono tessere associative che corrispondono ai filtri selezionati."}
                              </p>
                            </div>
                            {(searchQuery || statusFilter !== "all" || academicYearFilter !== "all") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setDebouncedSearch("");
                                  setStatusFilter("all");
                                  setAcademicYearFilter("all");
                                }}
                                className="cursor-pointer text-xs gap-1.5 h-8 mt-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{t("memberships.emptyState.clearFilters") || "Reimposta Filtri"}</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setCreateDialogOpen(true)}
                                className="cursor-pointer text-xs font-bold gap-1.5 h-8 mt-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t("memberships.emptyState.createFirst") || "Registra Primo Socio"}</span>
                              </Button>
                            )}
                          </div>
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
