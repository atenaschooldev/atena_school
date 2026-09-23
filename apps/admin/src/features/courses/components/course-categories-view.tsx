"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCourseCategories } from "../hooks/use-course-categories";
import type { CourseCategoryRecord, CreateCourseCategoryDto } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DataViewToolbar } from "@/components/shared/data-view-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/i18n/context";
import {
  Folder,
  Layers,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Hash,
} from "lucide-react";

export function CourseCategoriesView() {
  const { t, locale } = useTranslation();
  const {
    categories,
    loading,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCourseCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sortOrder", desc: false },
  ]);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CourseCategoryRecord | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const metricsData = useMemo(() => {
    const total = categories.length;
    const activeCount = categories.filter((c) => c.isActive ?? c.is_active).length;
    const totalCourses = categories.reduce((sum, c) => sum + (c.coursesCount ?? c.courses_count ?? 0), 0);

    return [
      {
        title: t("courses.metricTotalCategories") || "Categorie Totali",
        value: total,
        description: `${activeCount} ${t("courses.metricsActiveCategories") || "attive nel catalogo"}`,
        icon: Folder,
      },
      {
        title: t("courses.metricActiveCategories") || "Categorie Attive",
        value: activeCount,
        description: t("courses.metricsActiveCategoriesDesc") || "Visibili nel selettore del corso",
        icon: Layers,
      },
      {
        title: t("courses.metricLinkedCourses") || "Corsi Assegnati",
        value: totalCourses,
        description: t("courses.metricsLinkedCoursesDesc") || "Distribuiti su tutte le categorie",
        icon: BookOpen,
      },
      {
        title: t("courses.metricCategoryOrdering") || "Ordinamento",
        value: "Posizionale",
        description: t("courses.metricsCategoryOrderingDesc") || "Priorità numerica personalizzata",
        icon: Hash,
      },
    ];
  }, [categories, t]);

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const isActive = item.isActive ?? item.is_active ?? true;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchSlug = (item.slug || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchDesc) return false;
      }

      return true;
    });
  }, [categories, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: CourseCategoryRecord) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setFormSortOrder(category.sortOrder ?? category.sort_order ?? 0);
    setFormIsActive(category.isActive ?? category.is_active ?? true);
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payload: CreateCourseCategoryDto = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      description: formDescription.trim() || undefined,
      sortOrder: Number(formSortOrder) || 0,
      isActive: formIsActive,
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
    } else {
      await createCategory(payload);
    }
    setIsDialogOpen(false);
  };

  const handleToggleStatus = async (category: CourseCategoryRecord, newStatus: boolean) => {
    await updateCategory(category.id, { isActive: newStatus });
  };

  const columns: ColumnDef<CourseCategoryRecord>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label={t("common.selectAll") || "Seleziona tutti"}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t("common.selectRow") || "Seleziona riga"}
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>#</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground font-semibold">
            {row.original.sortOrder ?? row.original.sort_order ?? 0}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("courses.columnCategoryName") || "Nome Categoria"}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                <Folder className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-sm text-foreground truncate">{row.original.name}</span>
                <span className="text-xs text-muted-foreground font-mono truncate">{row.original.slug}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: t("courses.columnDescription") || "Descrizione",
        cell: ({ row }) => {
          return (
            <div className="max-w-[280px] truncate text-xs text-muted-foreground">
              {row.original.description || "—"}
            </div>
          );
        },
      },
      {
        id: "coursesCount",
        header: t("courses.columnCoursesCount") || "Corsi Associati",
        cell: ({ row }) => {
          const count = row.original.coursesCount ?? row.original.courses_count ?? 0;
          return (
            <Badge variant="outline" className="text-xs font-semibold">
              {count} {count === 1 ? (t("courses.courseSingle") || "corso") : (t("courses.coursePlural") || "corsi")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: t("common.status") || "Stato",
        cell: ({ row }) => {
          const isActive = row.original.isActive ?? row.original.is_active ?? true;
          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={isActive ? "attivo" : "archived"} />
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => handleToggleStatus(row.original, checked)}
                disabled={isUpdating}
                className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-600"
                aria-label={t("common.status") || "Stato"}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: t("common.actions") || "Azioni",
        enableHiding: false,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEdit(cat)}
                title={t("common.edit") || "Modifica"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setDeletingCategory(cat)}
                disabled={isDeleting}
                title={t("common.delete") || "Elimina"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUpdating, isDeleting, t, locale]
  );

  const table = useReactTable({
    data: filteredCategories,
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
      {/* ── Top Metrics ── */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsData.map((metric, index) => (
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

      {/* ── Main Toolbar & Content Container ── */}
      <div className="@container/main px-4 lg:px-6 space-y-4">
        <DataViewToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("courses.searchCategoriesPlaceholder") || "Cerca per nome, slug o descrizione..."}
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("common.status") || "Stato",
              options: [
                { value: "all", label: t("courses.allStatuses") || "Tutti gli stati" },
                { value: "active", label: t("common.active") || "Attivo" },
                { value: "inactive", label: t("courses.statusInactive") || "Disattivo" },
              ],
            },
          ]}
          actionElement={
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 cursor-pointer text-xs font-bold gap-1.5 shadow-xs"
                onClick={handleOpenCreate}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("courses.newCategoryBtn") || "Nuova Categoria"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 cursor-pointer text-xs font-medium"
                onClick={() => refresh()}
                disabled={loading}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                {t("common.refresh") || "Aggiorna"}
              </Button>
            </div>
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
                  <TableSkeletonRows columnsCount={columns.length} rowCount={5} />
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
                      {t("courses.noCategoriesFound") || "Nessuna categoria trovata."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingCategory
                  ? t("courses.editCategoryTitle") || "Modifica Categoria"
                  : t("courses.createCategoryTitle") || "Nuova Categoria"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-name" className="text-xs font-semibold">
                  {t("courses.categoryNameLabel") || "Nome Categoria"} *
                </Label>
                <Input
                  id="category-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="es. Corsi di Lingua, Certipass..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-slug" className="text-xs font-semibold">
                  {t("courses.categorySlugLabel") || "Slug URL (identificativo univoco)"}
                </Label>
                <Input
                  id="category-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="es. languages, certipass (opzionale)"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-desc" className="text-xs font-semibold">
                  {t("courses.categoryDescLabel") || "Descrizione"}
                </Label>
                <Textarea
                  id="category-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Breve descrizione della categoria di corsi..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category-sort" className="text-xs font-semibold">
                    {t("courses.sortOrder") || "Ordinamento"}
                  </Label>
                  <Input
                    id="category-sort"
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="flex flex-col justify-between space-y-1.5">
                  <Label htmlFor="category-active" className="text-xs font-semibold">
                    {t("courses.categoryActiveLabel") || "Stato di Pubblicazione"}
                  </Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      id="category-active"
                      checked={formIsActive}
                      onCheckedChange={setFormIsActive}
                      className="cursor-pointer data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {formIsActive ? t("common.active") || "Attivo" : t("courses.statusInactive") || "Disattivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer text-xs"
              >
                {t("common.cancel") || "Annulla"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="cursor-pointer text-xs font-semibold"
              >
                {isCreating || isUpdating
                  ? t("common.saving") || "Salvataggio..."
                  : t("common.save") || "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title={t("courses.deleteCategoryConfirmTitle") || "Elimina Categoria"}
        description={
          (
            t("courses.deleteCategoryConfirmDesc") ||
            "Sei sicuro di voler eliminare la categoria '{name}'? I corsi associati verranno scollegati ma non eliminati."
          ).replace("{name}", deletingCategory?.name || "")
        }
        onConfirm={async () => {
          if (deletingCategory) {
            await deleteCategory(deletingCategory.id);
            setDeletingCategory(null);
          }
        }}
        loading={isDeleting}
      />
    </div>
  );
}
