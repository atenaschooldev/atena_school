"use client";

import React, { useState, useMemo } from "react";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FolderTree,
  FileText,
  Briefcase,
  Receipt,
  ShieldCheck,
  Award,
  Landmark,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Layers,
} from "lucide-react";
import { useDocumentCategories } from "../hooks/use-document-categories";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import {
  DOCUMENT_CATEGORY_DICTIONARY,
  type DocumentCategoryRecord,
  type CreateDocumentCategoryDto,
  type UpdateDocumentCategoryDto,
} from "../types";
import { CreateCategoryDialog } from "./create-category-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { useTranslation } from "@/i18n/context";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ReactNode> = {
  "file-text": <FileText className="h-4 w-4 text-blue-500" />,
  "briefcase": <Briefcase className="h-4 w-4 text-purple-500" />,
  "receipt": <Receipt className="h-4 w-4 text-emerald-500" />,
  "shield-check": <ShieldCheck className="h-4 w-4 text-amber-500" />,
  "award": <Award className="h-4 w-4 text-indigo-500" />,
  "landmark": <Landmark className="h-4 w-4 text-rose-500" />,
};

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  "briefcase": Briefcase,
  "receipt": Receipt,
  "shield-check": ShieldCheck,
  "award": Award,
  "landmark": Landmark,
};

export function DocumentCategoriesView() {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDocumentCategories();
  const { templates } = useDocumentTemplates();

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<DocumentCategoryRecord | null>(null);

  const handleCreateOrUpdate = async (dto: any) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory.id,
        data: dto as UpdateDocumentCategoryDto,
      });
      setEditingCategory(null);
    } else {
      await createCategory(dto as CreateDocumentCategoryDto);
      setIsCreateOpen(false);
    }
  };

  const handleToggleActive = async (cat: DocumentCategoryRecord, newActive: boolean) => {
    await updateCategory({
      id: cat.id,
      data: { is_active: newActive },
    });
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    if (deletingCategory.is_system) {
      toast.error(tr("documents.categories.systemProtected", "Questa è una categoria di sistema fondamentale e non può essere eliminata."));
      setDeletingCategory(null);
      return;
    }

    await deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
  };

  const filteredData = useMemo(() => {
    return categories.filter((cat) => {
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !cat.is_active) return false;
        if (statusFilter === "inactive" && cat.is_active) return false;
      }
      return true;
    });
  }, [categories, statusFilter]);

  const columns: ColumnDef<DocumentCategoryRecord>[] = useMemo(
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
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => <CellCopyableId id={row.original.id} />,
        size: 80,
      },
      {
        accessorKey: "name_it",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.categories.columnCategory", "Categoria Documentale")}
          />
        ),
        cell: ({ row }) => {
          const cat = row.original;
          const dict = DOCUMENT_CATEGORY_DICTIONARY[cat.category_type];
          const displayName = locale === "en" ? (cat.name_en || dict?.label_en || cat.name_it) : cat.name_it;
          const IconComp = ICON_COMPONENTS[cat.icon] || FolderTree;

          return (
            <div className="flex items-center gap-3">
              <CellAvatar
                title={displayName}
                subtitle={cat.description || (locale === "en" ? "Category classification" : "Classificazione documentale")}
                icon={IconComp}
                badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              />
              {cat.is_system && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0"
                >
                  <Sparkles className="h-2.5 w-2.5 mr-1 text-amber-500" />
                  {tr("documents.templates.systemBadge", "Sistema")}
                </Badge>
              )}
            </div>
          );
        },
        size: 280,
      },
      {
        accessorKey: "category_type",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.categories.columnCode", "Codice / Dominio")}
          />
        ),
        cell: ({ row }) => {
          const dict = DOCUMENT_CATEGORY_DICTIONARY[row.original.category_type];
          return (
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="text-xs font-semibold text-foreground truncate">
                {dict ? (locale === "en" ? dict.label_en : dict.label_it) : `Categoria #${row.original.category_type}`}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {dict?.code || `ID: ${row.original.category_type}`}
              </span>
            </div>
          );
        },
        size: 200,
      },
      {
        id: "templates_count",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.categories.columnTemplatesCount", "Modelli Associati")}
          />
        ),
        cell: ({ row }) => {
          const count = templates.filter((t) => t.category_type === row.original.category_type).length;
          return (
            <Badge
              variant="outline"
              className="text-xs font-medium gap-1.5 border-border/60 bg-muted/30"
            >
              <Layers className="h-3 w-3 text-primary" />
              <span>
                {count}{" "}
                {locale === "en"
                  ? count === 1 ? "template" : "templates"
                  : count === 1 ? "modello" : "modelli"}
              </span>
            </Badge>
          );
        },
        size: 160,
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.categories.columnStatus", "Stato")}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={row.original.is_active}
                onCheckedChange={(val) => handleToggleActive(row.original, val)}
                disabled={isUpdating}
                className="scale-80 cursor-pointer data-[state=checked]:bg-emerald-600"
                aria-label={row.original.is_active ? "Attivo" : "Disattivo"}
              />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {row.original.is_active
                  ? tr("documents.templates.active", "Attivo")
                  : tr("documents.templates.inactive", "Disattivo")}
              </span>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">{tr("documents.categories.columnActions", "Azioni")}</span>,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditingCategory(cat);
                  setIsCreateOpen(true);
                }}
                title={tr("documents.categories.editCategory", "Modifica Categoria")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {!cat.is_system && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeletingCategory(cat)}
                  disabled={isDeleting}
                  title={tr("documents.templates.delete", "Elimina")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
        size: 100,
      },
    ],
    [locale, t, templates, isUpdating, isDeleting]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase().trim();
      const cat = row.original;
      return (
        cat.name_it.toLowerCase().includes(q) ||
        (cat.name_en && cat.name_en.toLowerCase().includes(q)) ||
        (cat.description && cat.description.toLowerCase().includes(q)) ||
        String(cat.category_type).includes(q) ||
        String(cat.id).includes(q)
      );
    },
  });

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const systemCategories = categories.filter((c) => c.is_system).length;
  const totalLinkedTemplates = templates.length;

  const statusFilterOptions = useMemo(() => {
    return [
      { value: "all", label: tr("documents.filterAllStatuses", "Tutti gli stati") },
      { value: "active", label: tr("documents.templates.active", "Attivo") },
      { value: "inactive", label: tr("documents.templates.inactive", "Disattivo") },
    ];
  }, [locale, t]);

  const toolbarFilters: FilterConfig[] = [
    {
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: tr("documents.categories.columnStatus", "Stato"),
      options: statusFilterOptions,
      width: "w-36",
    },
  ];

  const handleResetFilters = () => {
    setGlobalFilter("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Banner matching Notifications UI/UX */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{totalCategories}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.categories.statTotal", "Totale Categorie")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{activeCategories}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.categories.statActive", "Categorie Attive")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{totalLinkedTemplates}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.categories.statTemplates", "Modelli Collegati")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{systemCategories}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.categories.statSystem", "Categorie di Sistema")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. DataTable Toolbar matching Notifications view */}
      <DataTableToolbar
        table={table}
        searchQuery={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder={tr("documents.categories.searchPlaceholder", "Cerca categorie per nome o codice...")}
        filters={toolbarFilters}
        onResetFilters={handleResetFilters}
        actionButton={
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsCreateOpen(true);
            }}
            className="h-9 px-3.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.categories.newCategory", "Nuova Categoria")}
          </Button>
        }
      />

      {/* 3. AtenaDataTable */}
      <AtenaDataTable
        table={table}
        columnsCount={7}
        loading={isLoading}
        emptyTitle={tr("documents.emptyCategoriesTitle", "Nessuna categoria trovata")}
        emptyDescription={tr("documents.emptyCategoriesDesc", "Crea una nuova categoria per organizzare i tuoi modelli.")}
        emptyIcon={FolderTree}
        onResetFilters={handleResetFilters}
        emptyAction={
          <Button
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setIsCreateOpen(true);
            }}
            className="text-xs h-8 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.categories.newCategory", "Nuova Categoria")}
          </Button>
        }
      />

      {/* 4. Create & Edit Dialog */}
      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleCreateOrUpdate}
        isLoading={isCreating || isUpdating}
      />

      {/* 5. Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tr("documents.templates.delete", "Elimina Categoria")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                if (!deletingCategory) return "";
                const displayName = locale === "en"
                  ? deletingCategory.name_en || deletingCategory.name_it
                  : deletingCategory.name_it;
                const count = templates.filter((t) => t.category_type === deletingCategory.category_type).length;
                if (count > 0) {
                  return tr(
                    "documents.categories.deleteConfirmCount",
                    "Attenzione: ci sono {count} modelli associati a questa categoria. Sei sicuro di voler eliminare la categoria '{name}'?"
                  )
                    .replace("{count}", String(count))
                    .replace("{name}", displayName);
                }
                return tr(
                  "documents.categories.deleteConfirm",
                  "Sei sicuro di voler eliminare la categoria '{name}'?"
                ).replace("{name}", displayName);
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tr("documents.categories.cancel", "Annulla")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? tr("documents.categories.saving", "Salvataggio...")
                : tr("documents.templates.delete", "Elimina")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
