"use client";

import { useState, useMemo } from "react";
import { Plus, Tag, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePromoCodes } from "../hooks/use-promo-codes";
import { getPromoCodesTableColumns } from "./promo-codes-table-columns";
import { CreatePromoDialog } from "./create-promo-dialog";
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
    deletePromoCode,
  } = usePromoCodes();

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

  const metrics = [
    {
      title: t("promotions.totalPromoCodes"),
      value: stats.total,
      description: t("promotions.totalPromoCodes"),
      icon: Tag,
    },
    {
      title: t("promotions.activePromoCodes"),
      value: stats.active,
      description: t("promotions.activePromoCodes"),
      icon: CheckCircle2,
    },
    {
      title: t("promotions.totalUses"),
      value: stats.totalUses,
      description: t("promotions.totalUses"),
      icon: Sparkles,
    },
  ];

  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "inactive", label: t("common.inactive") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Metric summary banner */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <Card key={index} className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-semibold">{metric.title}</span>
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <metric.icon className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
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
  );
}
