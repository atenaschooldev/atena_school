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
  DocumentLogAction,
  DOCUMENT_LOG_ACTION_DICTIONARY,
} from "@atena/api-types";
import type { DocumentLogRecord } from "../types";
import { useDocumentLogs } from "../hooks/use-document-logs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { useTranslation } from "@/i18n/context";
import {
  History,
  Printer,
  Eye,
  Download,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  FileCode2,
  Activity,
  FileText,
  Trash2,
} from "lucide-react";

const ACTION_ICONS: Record<DocumentLogAction, React.ReactNode> = {
  [DocumentLogAction.GENERATED]: <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />,
  [DocumentLogAction.VIEWED]: <Eye className="h-3.5 w-3.5 text-slate-500" />,
  [DocumentLogAction.PRINTED]: <Printer className="h-3.5 w-3.5 text-emerald-500" />,
  [DocumentLogAction.DOWNLOADED_PDF]: <Download className="h-3.5 w-3.5 text-purple-500" />,
  [DocumentLogAction.SENT_EMAIL]: <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />,
  [DocumentLogAction.SIGNED]: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  [DocumentLogAction.REGENERATED]: <RefreshCw className="h-3.5 w-3.5 text-orange-500" />,
};

export function DocumentLogsView() {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => t(key) || fallback;
  const { logs, isLoading, deleteLog, clearLogs, isDeletingLog, isClearingLogs } = useDocumentLogs();

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [selectedLog, setSelectedLog] = useState<DocumentLogRecord | null>(null);
  const [copiedMetadata, setCopiedMetadata] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log: any) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = log.documents?.title?.toLowerCase().includes(q) || false;
        const matchNumber = log.documents?.document_number?.toLowerCase().includes(q) || false;
        const matchRecipient = log.documents?.recipient_name?.toLowerCase().includes(q) || false;
        const dict = DOCUMENT_LOG_ACTION_DICTIONARY[log.action as DocumentLogAction];
        const matchAction = (dict?.label_it || "").toLowerCase().includes(q) || (dict?.label_en || "").toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchRecipient && !matchAction) return false;
      }

      if (actionFilter !== "all") {
        if (String(log.action) !== actionFilter) return false;
      }

      return true;
    });
  }, [logs, searchQuery, actionFilter]);

  const handleDeleteLog = async (log: DocumentLogRecord) => {
    const confirmMsg = tr("documents.logs.deleteLog", `Elimina log #${log.id}?`);
    if (!window.confirm(confirmMsg)) return;
    await deleteLog(log.id);
  };

  const handleClearAllLogs = async () => {
    const confirmed = window.confirm(
      tr("documents.logs.clearConfirm", "Sei sicuro di voler eliminare tutti i log dei documenti? L'operazione è irreversibile.")
    );
    if (!confirmed) return;
    await clearLogs();
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ["ID", "Timestamp", "Action", "Document_Title", "Document_Number", "Recipient", "IP_Address"];
    const rows = filteredLogs.map((l: any) => {
      const dict = DOCUMENT_LOG_ACTION_DICTIONARY[l.action as DocumentLogAction];
      const actionLabel = locale === "en" ? (dict?.label_en || l.action) : (dict?.label_it || l.action);
      return [
        l.id,
        `"${new Date(l.created_at).toISOString()}"`,
        `"${actionLabel}"`,
        `"${l.documents?.title || ''}"`,
        `"${l.documents?.document_number || ''}"`,
        `"${l.documents?.recipient_name || ''}"`,
        `"${l.ip_address || ''}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_log_documents_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<DocumentLogRecord>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.logs.columnLogId", "Log ID")} />
        ),
        cell: ({ row }) => <CellCopyableId id={row.original.id} />,
        size: 90,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.logs.columnDateTime", "Data & Ora")} />
        ),
        cell: ({ row }) => {
          const dateStr = new Date(row.original.created_at).toLocaleString(locale === "en" ? "en-US" : "it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          return <span className="text-xs text-muted-foreground font-mono">{dateStr}</span>;
        },
        size: 160,
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.logs.columnAction", "Azione")} />
        ),
        cell: ({ row }) => {
          const action = row.original.action as DocumentLogAction;
          const dict = DOCUMENT_LOG_ACTION_DICTIONARY[action];
          const icon = ACTION_ICONS[action] || <Activity className="h-3.5 w-3.5" />;

          return (
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-muted">{icon}</span>
              <span className="text-xs font-semibold text-foreground">
                {locale === "en" ? dict?.label_en : dict?.label_it || "Azione"}
              </span>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "document_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("documents.logs.columnDocument", "Documento")} />
        ),
        cell: ({ row }) => {
          const log = row.original as any;
          return (
            <CellAvatar
              title={log.documents?.title || "Documento"}
              subtitle={log.documents?.document_number || log.document_id}
              icon={FileText}
              badgeColor="bg-blue-500/10 text-blue-600"
            />
          );
        },
        size: 220,
      },
      {
        id: "recipient",
        header: () => <span className="text-xs font-semibold text-muted-foreground">{tr("documents.logs.columnRecipient", "Destinatario")}</span>,
        cell: ({ row }) => {
          const log = row.original as any;
          return (
            <span className="text-xs font-medium text-foreground">
              {log.documents?.recipient_name || "---"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right text-xs font-semibold text-muted-foreground">{tr("documents.columnActions", "Azioni")}</div>,
        cell: ({ row }) => {
          return (
            <div className="flex justify-end items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(row.original)}
                className="h-7 text-xs font-medium text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                title={tr("documents.logs.details", "Dettagli")}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                {tr("documents.logs.details", "Dettagli")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteLog(row.original)}
                disabled={isDeletingLog}
                className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-md cursor-pointer"
                title={tr("documents.logs.deleteLog", "Elimina log")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [locale, isDeletingLog]
  );

  const table = useReactTable({
    data: filteredLogs,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const actionOptions = [
    { value: "all", label: tr("documents.logs.filterAllActions", "Tutte le azioni") },
    ...Object.entries(DOCUMENT_LOG_ACTION_DICTIONARY).map(([id, dict]) => ({
      value: id,
      label: locale === "en" ? dict.label_en : dict.label_it,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <DataTableToolbar
          table={table}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={tr("documents.searchPlaceholder", "Cerca nell'audit log...")}
          filters={[
            {
              value: actionFilter,
              onChange: setActionFilter,
              placeholder: tr("documents.logs.filterAllActions", "Filtra per azione"),
              options: actionOptions,
            },
          ]}
          onResetFilters={() => {
            setSearchQuery("");
            setActionFilter("all");
            setSorting([{ id: "created_at", desc: true }]);
          }}
        />

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="h-8 text-xs font-medium cursor-pointer border-border/70 hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.logs.exportCsv", "Esporta CSV")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAllLogs}
            disabled={logs.length === 0 || isClearingLogs}
            className="h-8 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {tr("documents.logs.clearAll", "Svuota Log")}
          </Button>
        </div>
      </div>

      <AtenaDataTable
        table={table}
        loading={isLoading}
        emptyTitle={tr("documents.emptyLogsTitle", "Nessun log registrato")}
        emptyDescription={tr("documents.emptyLogsDesc", "Le operazioni sui documenti verranno tracciate automaticamente qui.")}
        emptyIcon={History}
        onResetFilters={() => {
          setSearchQuery("");
          setActionFilter("all");
        }}
      />

      {/* Log Details Inspector Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
            <DialogHeader className="p-5 border-b bg-muted/40">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-primary" />
                {tr("documents.logs.inspectTitle", "Dettagli Log Operazione")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log ID: <span className="font-mono text-foreground font-semibold">{selectedLog.id}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">{tr("documents.logs.columnDateTime", "Data & Ora")}:</span>
                  <span className="font-mono font-medium">
                    {new Date(selectedLog.created_at).toLocaleString(locale === "en" ? "en-US" : "it-IT")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{tr("documents.logs.columnAction", "Azione")}:</span>
                  <span className="font-semibold text-foreground">
                    {locale === "en"
                      ? DOCUMENT_LOG_ACTION_DICTIONARY[selectedLog.action as DocumentLogAction]?.label_en
                      : DOCUMENT_LOG_ACTION_DICTIONARY[selectedLog.action as DocumentLogAction]?.label_it}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Document ID:</span>
                  <span className="font-mono">{selectedLog.document_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">{tr("documents.logs.columnIp", "Indirizzo IP")}:</span>
                  <span className="font-mono">{selectedLog.ip_address || "127.0.0.1"}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileCode2 className="h-3.5 w-3.5 text-primary" />
                    {locale === "en" ? "Metadata JSON Snapshot" : "Metadati JSON Snapshot"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog.metadata || {}, null, 2));
                      setCopiedMetadata(true);
                      setTimeout(() => setCopiedMetadata(false), 2000);
                    }}
                  >
                    {copiedMetadata ? (
                      <Check className="h-3 w-3 text-emerald-500 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedMetadata
                      ? tr("documents.logs.copied", "Copiato")
                      : tr("documents.logs.copyJson", "Copia JSON")}
                  </Button>
                </div>
                <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
