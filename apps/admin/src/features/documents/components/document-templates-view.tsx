"use client";

import React, { useState, useMemo, Suspense, lazy } from "react";
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
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_FORMAT_DICTIONARY,
  DocumentCategoryType,
  DocumentPaperFormat,
  resolveI18n,
  type DocumentTemplateRecord,
  type CreateDocumentTemplateDto,
} from "../types";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import { DocumentEditorDrawer } from "./document-editor-drawer";
import { CreateTemplateDialog } from "./create-template-dialog";
import { GenerateDocumentDialog } from "./generate-document-dialog";
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
import {
  Layers,
  FileText,
  Briefcase,
  Receipt,
  ShieldCheck,
  Award,
  Sparkles,
  Sliders,
  Copy,
  Trash2,
  Plus,
  RotateCcw,
  FolderTree,
  LayoutTemplate,
} from "lucide-react";

export function DocumentTemplatesView() {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const {
    templates,
    isLoading,
    createTemplate,
    duplicateTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isDuplicating,
    isUpdating,
    isDeleting,
  } = useDocumentTemplates();

  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplateRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState<DocumentTemplateRecord | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<DocumentTemplateRecord | null>(null);

  const getCategoryIcon = (categoryType: DocumentCategoryType) => {
    switch (categoryType) {
      case DocumentCategoryType.STUDENT_CONTRACTS:
        return FileText;
      case DocumentCategoryType.TEACHER_CONTRACTS:
        return Briefcase;
      case DocumentCategoryType.FINANCIAL:
        return Receipt;
      case DocumentCategoryType.LEGAL_AND_PRIVACY:
        return ShieldCheck;
      case DocumentCategoryType.CERTIFICATES:
        return Award;
      default:
        return FileText;
    }
  };

  const getCategoryBadgeColor = (categoryType: DocumentCategoryType) => {
    switch (categoryType) {
      case DocumentCategoryType.STUDENT_CONTRACTS:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case DocumentCategoryType.TEACHER_CONTRACTS:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case DocumentCategoryType.FINANCIAL:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case DocumentCategoryType.LEGAL_AND_PRIVACY:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case DocumentCategoryType.CERTIFICATES:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleOpenEditor = (tpl: DocumentTemplateRecord) => {
    setEditingTemplate(tpl);
    setIsDrawerOpen(true);
  };

  const handleCreateTemplate = async (dto: CreateDocumentTemplateDto) => {
    const created = await createTemplate(dto);
    if (created) {
      setIsCreateOpen(false);
      setEditingTemplate(created);
      setIsDrawerOpen(true);
    }
  };

  const handleDuplicate = async (tpl: DocumentTemplateRecord) => {
    await duplicateTemplate(tpl.id);
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    if (deletingTemplate.is_system) {
      toast.error(tr("documents.categories.systemProtected", "Questo è un template di sistema fondamentale e non può essere eliminato."));
      setDeletingTemplate(null);
      return;
    }

    await deleteTemplate(deletingTemplate.id);
    setDeletingTemplate(null);
  };

  const handleToggleActive = async (tpl: DocumentTemplateRecord, newActive: boolean) => {
    await updateTemplate({
      id: tpl.id,
      data: { is_active: newActive },
    });
  };

  const filteredData = useMemo(() => {
    return templates.filter((tpl) => {
      if (categoryFilter !== "all" && String(tpl.category_type) !== categoryFilter) {
        return false;
      }
      if (formatFilter !== "all" && String(tpl.paper_format) !== formatFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !tpl.is_active) return false;
        if (statusFilter === "inactive" && tpl.is_active) return false;
      }
      return true;
    });
  }, [templates, categoryFilter, formatFilter, statusFilter]);

  const columns: ColumnDef<DocumentTemplateRecord>[] = useMemo(
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
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.templates.columnName", "Modello / Layout")}
          />
        ),
        cell: ({ row }) => {
          const Icon = getCategoryIcon(row.original.category_type);
          const badgeColor = getCategoryBadgeColor(row.original.category_type);
          const displayName = resolveI18n(row.original.name, locale, "Modello");
          const displayDesc = resolveI18n(row.original.description, locale, (locale === "en" ? "Official template" : "Modello ufficiale"));
          return (
            <div className="flex items-center gap-3">
              <CellAvatar
                title={displayName}
                subtitle={displayDesc}
                icon={Icon}
                badgeColor={badgeColor}
              />
              {row.original.is_system && (
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
            title={tr("documents.templates.columnCategory", "Categoria")}
          />
        ),
        cell: ({ row }) => {
          const cat = DOCUMENT_CATEGORY_DICTIONARY[row.original.category_type];
          const Icon = getCategoryIcon(row.original.category_type);
          const badgeColor = getCategoryBadgeColor(row.original.category_type);
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium gap-1.5 ${badgeColor}`}
            >
              <Icon className="h-3 w-3" />
              {locale === "en" ? cat?.label_en : cat?.label_it || "Generale"}
            </Badge>
          );
        },
        size: 180,
      },
      {
        accessorKey: "paper_format",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.templates.columnFormat", "Formato Foglio")}
          />
        ),
        cell: ({ row }) => {
          const fmt = DOCUMENT_FORMAT_DICTIONARY[row.original.paper_format];
          return (
            <Badge
              variant="outline"
              className="text-xs font-mono border-border/70 bg-muted/40 text-foreground"
            >
              {locale === "en" ? fmt?.label_en : fmt?.label_it || "A4 Verticale"}
            </Badge>
          );
        },
        size: 140,
      },
      {
        id: "blocks_count",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.templates.columnBlocks", "Struttura Blocchi")}
          />
        ),
        cell: ({ row }) => {
          const blocksCount = row.original.blocks_config?.blocks?.length || 0;
          return (
            <Badge
              variant="outline"
              className="text-xs font-medium gap-1.5 border-border/60 bg-muted/30"
            >
              <Layers className="h-3 w-3 text-primary" />
              <span>
                {blocksCount}{" "}
                {locale === "en"
                  ? blocksCount === 1 ? "block" : "blocks"
                  : blocksCount === 1 ? "blocco" : "blocchi"}
              </span>
            </Badge>
          );
        },
        size: 140,
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={tr("documents.templates.columnStatus", "Stato")}
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
        header: () => <span className="sr-only">{tr("documents.templates.columnActions", "Azioni")}</span>,
        cell: ({ row }) => {
          const tpl = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 px-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold px-2.5 cursor-pointer border-border/70 hover:bg-muted"
                onClick={() => handleOpenEditor(tpl)}
                title={tr("documents.templates.editBlocks", "Visual Builder")}
              >
                <Sliders className="h-3.5 w-3.5 mr-1 text-primary" />
                <span className="hidden md:inline">{tr("documents.templates.editBlocks", "Visual Builder")}</span>
              </Button>

              <Button
                size="sm"
                className="h-8 text-xs font-semibold px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
                onClick={() => setGeneratingTemplate(tpl)}
                title={tr("documents.templates.generate", "Genera Documento")}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span className="hidden md:inline">{tr("documents.templates.generate", "Genera")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleDuplicate(tpl)}
                disabled={isDuplicating}
                title={tr("documents.templates.duplicate", "Duplica modello")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>

              {!tpl.is_system && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeletingTemplate(tpl)}
                  disabled={isDeleting}
                  title={tr("documents.templates.delete", "Elimina")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
        size: 260,
      },
    ],
    [locale, t, isDuplicating, isDeleting, isUpdating]
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
      const tpl = row.original;
      const nameStr = resolveI18n(tpl.name, locale, "").toLowerCase();
      const descStr = resolveI18n(tpl.description, locale, "").toLowerCase();
      return (
        nameStr.includes(q) ||
        descStr.includes(q) ||
        (tpl.template_type ? String(tpl.template_type).toLowerCase().includes(q) : false) ||
        String(tpl.id).includes(q)
      );
    },
  });

  const totalTemplates = templates.length;
  const activeTemplates = templates.filter((t) => t.is_active).length;
  const systemTemplates = templates.filter((t) => t.is_system).length;
  const coveredCategories = new Set(templates.map((t) => t.category_type)).size;

  const categoryFilterOptions = useMemo(() => {
    return [
      { value: "all", label: tr("documents.filterAllCategories", "Tutte le categorie") },
      ...Object.entries(DOCUMENT_CATEGORY_DICTIONARY).map(([id, dict]) => ({
        value: id,
        label: locale === "en" ? dict.label_en : dict.label_it,
      })),
    ];
  }, [locale, t]);

  const formatFilterOptions = useMemo(() => {
    return [
      { value: "all", label: locale === "en" ? "All Formats" : "Tutti i formati" },
      ...Object.entries(DOCUMENT_FORMAT_DICTIONARY).map(([id, dict]) => ({
        value: id,
        label: locale === "en" ? dict.label_en : dict.label_it,
      })),
    ];
  }, [locale]);

  const statusFilterOptions = useMemo(() => {
    return [
      { value: "all", label: tr("documents.filterAllStatuses", "Tutti gli stati") },
      { value: "active", label: tr("documents.templates.active", "Attivo") },
      { value: "inactive", label: tr("documents.templates.inactive", "Disattivo") },
    ];
  }, [locale, t]);

  const toolbarFilters: FilterConfig[] = [
    {
      value: categoryFilter,
      onChange: setCategoryFilter,
      placeholder: tr("documents.templates.columnCategory", "Categoria"),
      options: categoryFilterOptions,
      width: "w-44",
    },
    {
      value: formatFilter,
      onChange: setFormatFilter,
      placeholder: tr("documents.templates.columnFormat", "Formato Foglio"),
      options: formatFilterOptions,
      width: "w-40",
    },
    {
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: tr("documents.templates.columnStatus", "Stato"),
      options: statusFilterOptions,
      width: "w-32",
    },
  ];

  const handleResetFilters = () => {
    setGlobalFilter("");
    setCategoryFilter("all");
    setFormatFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Banner matching Notifications UI/UX */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{totalTemplates}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.templates.statTotal", "Totale Modelli")}
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
              <p className="text-2xl font-bold tracking-tight text-foreground">{activeTemplates}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.templates.statActive", "Modelli Attivi")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{systemTemplates}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.templates.statSystem", "Modelli di Sistema")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{coveredCategories}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {tr("documents.templates.statCategories", "Categorie Coperte")}
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
        searchPlaceholder={tr("documents.templates.searchPlaceholder", "Cerca modelli per nome, descrizione o codice...")}
        filters={toolbarFilters}
        onResetFilters={handleResetFilters}
        actionButton={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-3.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.templates.newTemplate", "Nuovo Modello")}
          </Button>
        }
      />

      {/* 3. AtenaDataTable with Complete State Management */}
      <AtenaDataTable
        table={table}
        columnsCount={8}
        loading={isLoading}
        emptyTitle={tr("documents.emptyTemplatesTitle", "Nessun modello disponibile")}
        emptyDescription={tr("documents.emptyTemplatesDesc", "Crea o configura i modelli di documenti nel Visual Builder.")}
        emptyIcon={LayoutTemplate}
        onResetFilters={handleResetFilters}
        emptyAction={
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs h-8 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.templates.newTemplate", "Nuovo Modello")}
          </Button>
        }
      />

      {/* 4. Modals & Drawers */}
      <CreateTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTemplate}
        isLoading={isCreating}
      />

      <DocumentEditorDrawer
        template={editingTemplate}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={isUpdating}
        onSave={async (updatedConfig) => {
          if (!editingTemplate) return;
          const res = await updateTemplate({
            id: editingTemplate.id,
            data: {
              blocks_config: updatedConfig,
              paper_format: updatedConfig.paper_format,
            },
          });
          setEditingTemplate(res);
        }}
      />

      {generatingTemplate && (
        <GenerateDocumentDialog
          open={!!generatingTemplate}
          onOpenChange={(open) => !open && setGeneratingTemplate(null)}
          defaultTemplateType={generatingTemplate.template_type}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingTemplate}
        onOpenChange={(open) => !open && setDeletingTemplate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tr("documents.templates.delete", "Elimina Modello")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tr("documents.templates.deleteConfirm", "Sei sicuro di voler eliminare il modello '{name}'? L'azione è irreversibile.")
                .replace("{name}", deletingTemplate?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tr("documents.createTemplate.cancel", "Annulla")}
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
