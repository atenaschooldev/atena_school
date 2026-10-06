"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Sparkles,
  LayoutTemplate,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketingPopups } from "../hooks/use-marketing-popups";
import { getMarketingPopupsTableColumns } from "./marketing-popups-table-columns";
import { CreatePopupDialog } from "./create-popup-dialog";
import { PopupPreviewModal } from "./popup-preview-modal";
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
import type { MarketingPopupItem, CreateMarketingPopupInput } from "@atena/api-types";

export function MarketingPopupsView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketingPopupItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MarketingPopupItem | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    popups,
    loading,
    createPopup,
    updatePopup,
    togglePopup,
    deletePopup,
  } = useMarketingPopups();

  const filteredPopups = useMemo(() => {
    return popups.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = (p.title || "").toLowerCase().includes(q);
        const matchDisplay = (p.display_title || "").toLowerCase().includes(q);
        const matchBadge = (p.badge_text || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDisplay && !matchBadge) return false;
      }
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      if (statusFilter === "image_only" && p.content_type !== "image_only") return false;
      if (statusFilter === "combined" && p.content_type !== "combined") return false;
      return true;
    });
  }, [popups, searchQuery, statusFilter]);

  const handleEdit = (item: MarketingPopupItem) => {
    setEditingItem(item);
    setCreateDialogOpen(true);
  };

  const handlePreview = (item: MarketingPopupItem) => {
    setPreviewItem(item);
    setPreviewModalOpen(true);
  };

  const handleCreateOrUpdate = async (data: CreateMarketingPopupInput) => {
    if (editingItem) {
      await updatePopup(editingItem.id, data);
    } else {
      await createPopup(data);
    }
  };

  const columns = useMemo(
    () =>
      getMarketingPopupsTableColumns({
        onEdit: handleEdit,
        onDelete: deletePopup,
        onToggleStatus: togglePopup,
        onPreview: handlePreview,
        t,
      }),
    [deletePopup, togglePopup, t]
  );

  const table = useReactTable({
    data: filteredPopups,
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
    const total = popups.length;
    const active = popups.filter((p) => p.is_active).length;
    const imageOnlyCount = popups.filter((p) => p.content_type === "image_only").length;
    return { total, active, imageOnlyCount };
  }, [popups]);

  const filterOptions = [
    { value: "all", label: t("common.all") || "Tutti" },
    { value: "active", label: t("common.active") || "Attivi" },
    { value: "inactive", label: t("common.inactive") || "Inattivi" },
    { value: "image_only", label: t("promotions.popups.formatImageOnly") || "Solo Immagine" },
    { value: "combined", label: t("promotions.popups.formatCombined") || "Ibridi (Foto+Testo)" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Banner */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold">
                  {t("promotions.popups.totalPopups")}
                </span>
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <LayoutTemplate className="size-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold">
                  {t("promotions.popups.activePopups")}
                </span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold">
                  {t("promotions.popups.imageOnlyCount")}
                </span>
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <ImageIcon className="size-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.imageOnlyCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataTableToolbar
          table={table}
          searchKey="title"
          searchPlaceholder={t("promotions.popups.searchPlaceholder")}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterKey="is_active"
          filterTitle={t("common.status") || "Stato"}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={filterOptions}
          actionButton={
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setCreateDialogOpen(true);
              }}
              className="h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg shadow-xs"
            >
              <Plus className="size-4" />
              <span>{t("promotions.popups.createPopup")}</span>
            </Button>
          }
        />

        <AtenaDataTable
          table={table}
          columns={columns}
          loading={loading}
          emptyMessage={t("promotions.popups.emptyState")}
        />
      </div>

      <CreatePopupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        initialData={editingItem}
        onSubmit={handleCreateOrUpdate}
      />

      <PopupPreviewModal
        popup={previewItem}
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
      />
    </div>
  );
}
