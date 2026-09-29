"use client";

import { useState, useMemo } from "react";
import { useMemberships } from "../hooks/use-memberships";
import { MembershipsMetrics } from "./memberships-metrics";
import { getMembershipsTableColumns } from "./memberships-table-columns";
import { CreateMembershipDialog } from "./create-membership-dialog";
import { RegistrationFeeSettingsDialog } from "./registration-fee-settings-dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { Plus, Sliders } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import {
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

export function MembershipsView() {
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { memberships, stats, loading, toggleStatus, refresh } = useMemberships({
    status: statusFilter === "all" ? undefined : statusFilter,
    academicYear: academicYearFilter === "all" ? undefined : academicYearFilter,
    search: debouncedSearch || undefined,
  });

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const handler = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
    return () => clearTimeout(handler);
  };

  const columns = useMemo(
    () =>
      getMembershipsTableColumns({
        onToggleStatus: (id) => toggleStatus(id),
        t,
      }),
    [toggleStatus, t]
  );

  const academicYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -2; i <= 2; i++) {
      const y = currentYear + i;
      const str = `${y}/${y + 1}`;
      years.push({ value: str, label: str });
    }
    return [{ value: "all", label: t("memberships.allAcademicYears") || "Tutti gli anni" }, ...years];
  }, [t]);

  const statusOptions = [
    { value: "all", label: t("common.all") || "Tutti gli stati" },
    { value: "active", label: t("common.active") || "Attivo" },
    { value: "pending", label: t("common.pending") || "In attesa" },
    { value: "expired", label: t("memberships.membershipExpired") || "Scaduto" },
  ];

  const table = useReactTable({
    data: memberships,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <MembershipsMetrics stats={stats} />

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="studentName"
          searchPlaceholder={t("memberships.searchMember") || "Cerca per nome studente, CF o email..."}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          filterKey="status"
          filterTitle={t("memberships.cardStatus") || "Stato Tessera"}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={statusOptions}
          actionButton={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsDialogOpen(true)}
                className="h-8 text-xs font-medium gap-1.5 cursor-pointer rounded-lg shadow-2xs"
              >
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t("memberships.tabSettings") || "Configura Quota"}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-2xs"
              >
                <Plus className="h-4 w-4" />
                <span>{t("memberships.addMembership") || "Registra Socio"}</span>
              </Button>
            </div>
          }
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("memberships.emptyState.title") || "Nessun socio trovato"}
        />
      </div>

      <CreateMembershipDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refresh();
        }}
      />

      <RegistrationFeeSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        onSaved={() => {
          refresh();
        }}
      />
    </div>
  );
}

