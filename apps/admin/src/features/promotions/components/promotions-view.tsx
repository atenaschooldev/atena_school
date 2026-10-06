import { useState, useMemo } from "react";
import { Plus, Tag, Sparkles, CheckCircle2, Power, PowerOff, RefreshCw, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePromoCodes } from "../hooks/use-promo-codes";
import { useMarketingPopups } from "../hooks/use-marketing-popups";
import { getPromoCodesTableColumns } from "./promo-codes-table-columns";
import { CreatePromoDialog } from "./create-promo-dialog";
import { MarketingPopupsView } from "./marketing-popups-view";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
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
import type { PromoCodeItem, CreatePromoCodeInput } from "../types";

export function PromotionsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"popups" | "promos">("popups");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoCodeItem | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "code", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    promoCodes: allPromoCodes,
    loading,
    createPromoCode,
    updatePromoCode,
    togglePromoCode,
    toggleAllPromoCodes,
    deletePromoCode,
    isTogglingAll,
  } = usePromoCodes();

  const { popups } = useMarketingPopups();

  const isAllActive = allPromoCodes.length > 0 && allPromoCodes.every((p) => p.is_active);
  const isAllInactive = allPromoCodes.length > 0 && allPromoCodes.every((p) => !p.is_active);
  const hasAnyActive = allPromoCodes.some((p) => p.is_active);

  const filteredPromoCodes = useMemo(() => {
    return allPromoCodes.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchCode = (p.code || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        if (!matchCode && !matchDesc) return false;
      }
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      return true;
    });
  }, [allPromoCodes, searchQuery, statusFilter]);

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

  const handleToggleAll = async (targetActive: boolean) => {
    await toggleAllPromoCodes(targetActive);
  };

  const columns = useMemo(
    () =>
      getPromoCodesTableColumns({
        onEdit: handleEdit,
        onDelete: deletePromoCode,
        onToggleStatus: togglePromoCode,
        t,
      }),
    [deletePromoCode, togglePromoCode, t]
  );

  const table = useReactTable({
    data: filteredPromoCodes,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stats = useMemo(() => {
    const total = allPromoCodes.length;
    const active = allPromoCodes.filter((p) => p.is_active).length;
    const totalUses = allPromoCodes.reduce((acc, p) => acc + (p.used_count || 0), 0);
    return { total, active, totalUses };
  }, [allPromoCodes]);

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "inactive", label: t("common.inactive") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Navigation Tabs (matching CRM forms style) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3 flex-wrap gap-3">
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border/60 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("popups")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "popups"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate className="h-4 w-4 text-primary" />
            <span>{t("promotions.tabPopups") || "Popup Marketing"}</span>
            <span className="text-[11px] font-medium opacity-70">({popups.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("promos")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "promos"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>{t("promotions.tabPromoCodes") || "Codici Promo"}</span>
            <span className="text-[11px] font-medium opacity-70">({allPromoCodes.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "popups" ? (
        <MarketingPopupsView />
      ) : (
        <div className="space-y-6">
          {/* Metric summary banner with Master Promo Switch */}
          <div className="@container/main px-4 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Total Promo Codes */}
              <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold">{t("promotions.totalPromoCodes")}</span>
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Tag className="size-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Total Uses in Enrollments */}
              <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold">{t("promotions.totalUses")}</span>
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Sparkles className="size-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalUses}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Master Promotions Toggle */}
              <Card className={`border backdrop-blur-sm shadow-xs transition-all ${
                stats.total === 0
                  ? "border-border/60 bg-card/70"
                  : isAllActive
                  ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : isAllInactive
                  ? "border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/10"
                  : "border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10"
              }`}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold flex items-center gap-1.5">
                      <Power className="size-3.5 text-primary" />
                      {t("promotions.globalStatus") || "Stato Globale Promozioni"}
                    </span>
                    <div className="flex items-center gap-2">
                      {isTogglingAll && <RefreshCw className="size-3.5 animate-spin text-muted-foreground" />}
                      <Switch
                        checked={hasAnyActive}
                        disabled={stats.total === 0 || isTogglingAll}
                        onCheckedChange={(checked) => handleToggleAll(checked)}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      {stats.total === 0 ? (
                        <span className="text-xs text-muted-foreground">0 codici configurati</span>
                      ) : isAllActive ? (
                        <Badge variant="outline" className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30 border-emerald-500/30 gap-1">
                          <CheckCircle2 className="size-3" />
                          {t("promotions.allActive") || "Tutti i codici attivi"} ({stats.active}/{stats.total})
                        </Badge>
                      ) : isAllInactive ? (
                        <Badge variant="outline" className="text-xs font-bold text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30 border-rose-500/30 gap-1">
                          <PowerOff className="size-3" />
                          {t("promotions.allDisabled") || "Tutti i codici disattivati"} (0/{stats.total})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-bold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30 border-amber-500/30">
                          {stats.active} su {stats.total} attivi
                        </Badge>
                      )}
                    </div>

                    {stats.total > 0 && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isAllActive || isTogglingAll}
                          onClick={() => handleToggleAll(true)}
                          className="h-6 px-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer rounded-md"
                        >
                          {t("promotions.enableAll") || "Attiva tutti"}
                        </Button>
                        <span className="text-muted-foreground/40 text-xs">|</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isAllInactive || isTogglingAll}
                          onClick={() => handleToggleAll(false)}
                          className="h-6 px-2 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer rounded-md"
                        >
                          {t("promotions.disableAll") || "Disattiva tutti"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="@container/main px-4 lg:px-6 space-y-4">
            <DataTableToolbar
              table={table}
              searchKey="code"
              searchPlaceholder={t("common.search")}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterKey="is_active"
              filterTitle={t("common.status")}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={statusOptions}
              actionButton={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setCreateDialogOpen(true);
                    }}
                    className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t("promotions.createPromoCode")}</span>
                  </Button>
                </div>
              }
            />

            <AtenaDataTable
              table={table}
              columns={columns}
              loading={loading}
              emptyMessage={t("promotions.emptyState.title") || t("common.search")}
            />
          </div>

          <CreatePromoDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            initialData={editingItem}
            onSubmit={handleCreateOrUpdate}
          />
        </div>
      )}
    </div>
  );
}
