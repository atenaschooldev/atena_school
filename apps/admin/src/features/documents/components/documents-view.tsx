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
  DocumentCategoryType,
  DocumentStatus,
  DocumentType,
  DocumentPaperFormat,
  DOCUMENT_CATEGORY_DICTIONARY,
  DOCUMENT_STATUS_DICTIONARY,
  DOCUMENT_TYPE_DICTIONARY,
  DOCUMENT_FORMAT_DICTIONARY,
} from "@atena/api-types";
import type { DocumentRecord } from "../types";
import { useDocuments } from "../hooks/use-documents";
import { useDocumentTemplates } from "../hooks/use-document-templates";
import { useDocumentCategories } from "../hooks/use-document-categories";
import { useDocumentLogs } from "../hooks/use-document-logs";
import { GenerateDocumentDialog } from "./generate-document-dialog";
import { DocumentTemplatesView } from "./document-templates-view";
import { DocumentCategoriesView } from "./document-categories-view";
import { DocumentLogsView } from "./document-logs-view";
import { DocumentLivePreview } from "./builder/document-live-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/i18n/context";
import {
  FileText,
  Layers,
  FolderTree,
  History,
  Plus,
  Trash2,
  Eye,
  Printer,
  Sparkles,
  Award,
  Receipt,
  Briefcase,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

export function DocumentsView() {
  const { t, locale } = useTranslation();

  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const [activeTab, setActiveTab] = useState<"registry" | "templates" | "categories" | "logs">("registry");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [previewingDoc, setPreviewingDoc] = useState<DocumentRecord | null>(null);

  const parsedCategory = categoryFilter !== "all" ? (Number(categoryFilter) as DocumentCategoryType) : undefined;
  const parsedStatus = statusFilter !== "all" ? (Number(statusFilter) as DocumentStatus) : undefined;

  const { documents, isLoading, deleteDocument, isDeleting, refetch } = useDocuments({
    category_type: parsedCategory,
    status: parsedStatus,
    search: searchQuery.trim() || undefined,
  });

  const { templates } = useDocumentTemplates();
  const { categories } = useDocumentCategories();
  const { logs } = useDocumentLogs();

  // Metrics KPI summary cards matching Notifications view
  const metricsData = useMemo(() => {
    const totalDocs = documents.length;
    const activeTemplatesCount = templates.filter((t) => t.is_active).length;
    const categoriesCount = categories.length;
    const totalLogsCount = logs.length;

    return [
      {
        title: tr("documents.metricTotalDocuments", "Totale Documenti"),
        value: totalDocs,
        description: `${totalDocs} ${tr("documents.metricTotalDocumentsDesc", "emessi e registrati a sistema")}`,
        icon: FileText,
        color: "text-blue-500 bg-blue-500/10",
      },
      {
        title: tr("documents.metricActiveTemplates", "Modelli & Builder"),
        value: activeTemplatesCount,
        description: `${activeTemplatesCount} ${tr("documents.metricActiveTemplatesDesc", "modelli pronti per la generazione")}`,
        icon: Layers,
        color: "text-indigo-500 bg-indigo-500/10",
      },
      {
        title: tr("documents.metricCategories", "Categorie Documentali"),
        value: categoriesCount,
        description: tr("documents.metricCategoriesDesc", "Iscrizioni, Contratti, Ricevute fiscali"),
        icon: FolderTree,
        color: "text-amber-500 bg-amber-500/10",
      },
      {
        title: tr("documents.metricAuditActions", "Audit & Tracciamento"),
        value: totalLogsCount,
        description: tr("documents.metricAuditActionsDesc", "Operazioni e registri di firma tracciati"),
        icon: History,
        color: "text-emerald-500 bg-emerald-500/10",
      },
    ];
  }, [documents, templates, categories, logs, t]);

  const handleDeleteDocument = async (doc: DocumentRecord) => {
    const confirmed = window.confirm(
      (tr("documents.deleteConfirm", "Sei sicuro di voler eliminare il documento '{number}'? L'azione non può essere annullata."))
        .replace("{number}", doc.document_number)
    );
    if (!confirmed) return;
    await deleteDocument(doc.id);
  };

  const getCategoryIcon = (categoryType: DocumentCategoryType) => {
    switch (categoryType) {
      case DocumentCategoryType.STUDENT_ENROLLMENT:
        return FileText;
      case DocumentCategoryType.TEACHER_CONTRACT:
        return Briefcase;
      case DocumentCategoryType.RECEIPT_INVOICE:
        return Receipt;
      case DocumentCategoryType.LEGAL_REGULATION:
        return ShieldCheck;
      case DocumentCategoryType.CERTIFICATE:
        return Award;
      default:
        return FileText;
    }
  };

  const columns: ColumnDef<DocumentRecord>[] = useMemo(
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
        size: 100,
      },
      {
        accessorKey: "document_number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnNumber", "N. Documento")} />
        ),
        cell: ({ row }) => {
          const doc = row.original;
          const Icon = getCategoryIcon(doc.category_type);
          return (
            <CellAvatar
              title={doc.document_number}
              subtitle={doc.title}
              icon={Icon}
              badgeColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
          );
        },
        size: 220,
      },
      {
        accessorKey: "category_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnCategory", "Categoria / Tipo")} />
        ),
        cell: ({ row }) => {
          const cat = DOCUMENT_CATEGORY_DICTIONARY[row.original.category_type];
          const docType = DOCUMENT_TYPE_DICTIONARY[row.original.document_type];
          return (
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="text-[11px] font-semibold border-border/60 bg-muted/40 w-fit">
                {cat?.label_it || "Generale"}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">
                {docType?.label_it || "---"}
              </span>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "recipient_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnRecipient", "Intestatario / Destinatario")} />
        ),
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-xs text-foreground">
                {doc.recipient_name || "---"}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                {doc.recipient_tax_code && <span>CF: {doc.recipient_tax_code}</span>}
                {doc.recipient_email && <span>{doc.recipient_email}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "paper_format",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnPaperFormat", "Formato")} />
        ),
        cell: ({ row }) => {
          const fmt = DOCUMENT_FORMAT_DICTIONARY[row.original.paper_format];
          return (
            <Badge variant="secondary" className="text-[10px] font-mono bg-muted/60 text-muted-foreground">
              {fmt?.label_it || "A4 Verticale"}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnCreatedAt", "Data")} />
        ),
        cell: ({ row }) => {
          const dateStr = new Date(row.original.created_at).toLocaleDateString(locale === "en" ? "en-US" : "it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return <span className="text-xs text-muted-foreground font-mono">{dateStr}</span>;
        },
        size: 110,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.columnStatus", "Stato")} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeStatus: "attivo" | "confermato" | "in attesa" | "scaduto" | "annullato" | "bozza" = "confermato";

          if (status === DocumentStatus.DRAFT) badgeStatus = "bozza";
          else if (status === DocumentStatus.GENERATED) badgeStatus = "confermato";
          else if (status === DocumentStatus.SENT) badgeStatus = "attivo";
          else if (status === DocumentStatus.SIGNED) badgeStatus = "confermato";
          else if (status === DocumentStatus.EXPIRED) badgeStatus = "scaduto";
          else if (status === DocumentStatus.CANCELLED) badgeStatus = "annullato";

          return <StatusBadge status={badgeStatus} />;
        },
        size: 120,
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-xs font-medium text-muted-foreground">
            {t("common.actions") || "Azioni"}
          </div>
        ),
        enableHiding: false,
        cell: ({ row }) => {
          const doc = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => setPreviewingDoc(doc)}
                title={tr("documents.preview", "Anteprima & Stampa")}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400 transition-colors"
                onClick={() => handleDeleteDocument(doc)}
                disabled={isDeleting}
                title={t("common.delete") || "Elimina"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        size: 90,
      },
    ],
    [t, locale, isDeleting]
  );

  const table = useReactTable({
    data: documents,
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

  const categoryOptions = [
    { value: "all", label: tr("documents.filterAllCategories", "Tutte le categorie") },
    ...categories.map((c) => ({
      value: String(c.category_type),
      label: c.name_it,
    })),
  ];

  const statusOptions = [
    { value: "all", label: tr("documents.filterAllStatuses", "Tutti gli stati") },
    { value: String(DocumentStatus.GENERATED), label: "Generato / Emesso" },
    { value: String(DocumentStatus.SIGNED), label: "Firmato" },
    { value: String(DocumentStatus.SENT), label: "Inviato" },
    { value: String(DocumentStatus.DRAFT), label: "Bozza" },
    { value: String(DocumentStatus.CANCELLED), label: "Annullato" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Navigation Tabs (Registry vs Templates vs Categories vs Audit Logs) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3 flex-wrap gap-3">
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border/60 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("registry")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "registry"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4 text-blue-500" />
            {tr("documents.tabRegistry", "Registro Documenti")} ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            {tr("documents.tabTemplates", "Modelli & Visual Builder")} ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderTree className="h-4 w-4 text-amber-500" />
            {tr("documents.tabCategories", "Categorie")} ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4 text-emerald-500" />
            {tr("documents.tabLogs", "Audit Trail & Log")} ({logs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 text-xs font-medium cursor-pointer border-border/60 hover:bg-muted"
            title={t("common.refresh") || "Aggiorna"}
          >
            <RotateCw className="h-3.5 w-3.5 mr-1.5" />
            {t("common.refresh") || "Aggiorna"}
          </Button>

          <Button
            onClick={() => setIsGenerateOpen(true)}
            size="sm"
            className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.newDocument", "Nuovo Documento")}
          </Button>
        </div>
      </div>

      {activeTab === "templates" ? (
        <div className="@container/main px-4 lg:px-6">
          <DocumentTemplatesView />
        </div>
      ) : activeTab === "categories" ? (
        <div className="@container/main px-4 lg:px-6">
          <DocumentCategoriesView />
        </div>
      ) : activeTab === "logs" ? (
        <div className="@container/main px-4 lg:px-6">
          <DocumentLogsView />
        </div>
      ) : (
        <>
          {/* ── Top Metrics Grid ── */}
          <div className="@container/main px-4 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricsData.map((metric, index) => (
                <Card
                  key={index}
                  className="border border-border/60 bg-card/70 backdrop-blur-sm shadow-xs"
                >
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-semibold">
                        {metric.title}
                      </span>
                      <div className={`p-2 rounded-lg ${metric.color}`}>
                        <metric.icon className="size-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {metric.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Toolbar & Table ── */}
          <div className="@container/main px-4 lg:px-6 space-y-4">
            <DataTableToolbar
              table={table}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={tr("common.search", "Cerca per numero, nominativo, CF, email...")}
              filters={[
                {
                  value: categoryFilter,
                  onChange: setCategoryFilter,
                  placeholder: tr("documents.columnCategory", "Categoria"),
                  options: categoryOptions,
                },
                {
                  value: statusFilter,
                  onChange: setStatusFilter,
                  placeholder: tr("documents.columnStatus", "Stato"),
                  options: statusOptions,
                },
              ]}
              onResetFilters={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
                setSorting([{ id: "created_at", desc: true }]);
              }}
            />

            <AtenaDataTable
              table={table}
              loading={isLoading}
              emptyTitle={tr("documents.emptyRegistryTitle", "Nessun documento trovato")}
              emptyDescription={tr("documents.emptyRegistryDesc", "Non sono presenti documenti corrispondenti ai filtri selezionati. Clicca su \"Nuovo Documento\" per emetterne uno.")}
              emptyIcon={FileText}
              onResetFilters={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
              emptyAction={
                <Button
                  onClick={() => setIsGenerateOpen(true)}
                  size="sm"
                  className="h-8 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {tr("documents.newDocument", "Nuovo Documento")}
                </Button>
              }
            />
          </div>
        </>
      )}

      {/* Generate Document Dialog */}
      <GenerateDocumentDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {/* Document View / Print Modal */}
      {previewingDoc && (
        <Dialog open={!!previewingDoc} onOpenChange={(open) => !open && setPreviewingDoc(null)}>
          <DialogContent className="max-w-[96vw] w-[1100px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background">
            <DialogHeader className="p-4 border-b bg-muted/40 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {previewingDoc.title}
                  <span className="font-mono text-xs font-normal text-muted-foreground ml-2">
                    ({previewingDoc.document_number})
                  </span>
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Intestatario: <strong>{previewingDoc.recipient_name || "---"}</strong> | Creato il:{" "}
                  {new Date(previewingDoc.created_at).toLocaleString(locale === "en" ? "en-US" : "it-IT")}
                </div>
              </div>

              <div className="flex items-center gap-2 pr-6">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  {tr("documents.preview", "Stampa / PDF")}
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
              <DocumentLivePreview
                blocksConfig={
                  previewingDoc.template_data?.blocks_config || {
                    paper_format: previewingDoc.paper_format || DocumentPaperFormat.A4_PORTRAIT,
                    blocks: [],
                  }
                }
                formData={previewingDoc.template_data?.form_data || {}}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
