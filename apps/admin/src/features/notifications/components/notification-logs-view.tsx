"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  NotificationChannel,
  NotificationStatus,
  NOTIFICATION_CHANNEL_DICTIONARY,
  NOTIFICATION_STATUS_DICTIONARY,
} from "@atena/api-types";
import { useNotificationLogs } from "../hooks/use-notification-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Mail,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  Send,
  Radio,
  FileCode2,
  Activity,
  Copy,
  Check,
} from "lucide-react";

export function NotificationLogsView() {
  const { t, locale } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const [globalFilter, setGlobalFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const parsedChannel =
    channelFilter === "email"
      ? NotificationChannel.EMAIL
      : channelFilter === "telegram"
      ? NotificationChannel.TELEGRAM
      : undefined;

  const parsedStatus =
    statusFilter === "sent"
      ? NotificationStatus.SENT
      : statusFilter === "failed"
      ? NotificationStatus.FAILED
      : undefined;

  const { logs, total, loading, refresh } = useNotificationLogs({
    channel: parsedChannel,
    status: parsedStatus,
    search: globalFilter.trim() || undefined,
  });

  const getChannelLabel = (channel: number): string => {
    const entry = NOTIFICATION_CHANNEL_DICTIONARY[channel as keyof typeof NOTIFICATION_CHANNEL_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return channel === NotificationChannel.EMAIL ? "Email" : "Telegram";
  };

  const getStatusLabel = (status: number): string => {
    const entry = NOTIFICATION_STATUS_DICTIONARY[status as keyof typeof NOTIFICATION_STATUS_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return status === NotificationStatus.SENT ? "Inviato" : "Fallito";
  };

  const formatDate = (iso: string) => {
    try {
      const loc = locale === "en" ? "en-US" : "it-IT";
      return new Date(iso).toLocaleString(loc, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Metrics computation
  const stats = useMemo(() => {
    const totalCount = total || logs.length;
    const emailCount = logs.filter((l) => Number(l.channel) === NotificationChannel.EMAIL).length;
    const telegramCount = logs.filter((l) => Number(l.channel) === NotificationChannel.TELEGRAM).length;
    const sentCount = logs.filter((l) => Number(l.status) === NotificationStatus.SENT).length;
    const failedCount = logs.filter((l) => Number(l.status) === NotificationStatus.FAILED).length;
    return {
      total: totalCount,
      email: emailCount,
      telegram: telegramCount,
      sent: sentCount,
      failed: failedCount,
    };
  }, [logs, total]);

  const columns: ColumnDef<any>[] = useMemo(
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
              aria-label={tr("common.selectAll", "Seleziona tutti")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center px-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={tr("common.selectRow", "Seleziona riga")}
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
        size: 90,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.logColDate", "Data e Ora")} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2 text-xs font-mono">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-foreground whitespace-nowrap">
                {formatDate(row.original.created_at)}
              </span>
            </div>
          );
        },
        size: 170,
      },
      {
        accessorKey: "channel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.columnChannel", "Canale")} />
        ),
        cell: ({ row }) => {
          const isEmail = Number(row.original.channel) === NotificationChannel.EMAIL;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium gap-1.5 px-2 py-0.5 ${
                isEmail
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10"
              }`}
            >
              {isEmail ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
              {getChannelLabel(Number(row.original.channel))}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "recipient",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.logColRecipient", "Destinatario")} />
        ),
        cell: ({ row }) => {
          const isEmail = Number(row.original.channel) === NotificationChannel.EMAIL;
          return (
            <CellAvatar
              title={row.original.recipient}
              subtitle={row.original.event_type || (row.original.notification_trigger_id ? `Trigger: ${row.original.notification_trigger_id}` : undefined)}
              icon={isEmail ? Mail : MessageSquare}
              badgeColor={isEmail ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"}
            />
          );
        },
        size: 240,
      },
      {
        accessorKey: "subject",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.logColSubject", "Oggetto / Evento")} />
        ),
        cell: ({ row }) => {
          const subj = row.original.subject;
          const eventType = row.original.event_type;
          return (
            <div className="flex flex-col gap-0.5 max-w-[280px]">
              <span className="text-xs font-medium text-foreground truncate">
                {subj || eventType || "—"}
              </span>
              {subj && eventType && (
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  {eventType}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.logColStatus", "Stato")} />
        ),
        cell: ({ row }) => {
          const isSuccess = Number(row.original.status) === NotificationStatus.SENT;
          const lastEvent = row.original.response?.last_event;
          const errMsg = row.original.error_message;

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {isSuccess ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {getStatusLabel(NotificationStatus.SENT)}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs font-semibold gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getStatusLabel(NotificationStatus.FAILED)}
                </Badge>
              )}
              {lastEvent && (
                <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                  {String(lastEvent).replace("email.", "")}
                </Badge>
              )}
              {errMsg && !isSuccess && (
                <span className="text-[10px] text-rose-500 font-mono truncate max-w-[120px]" title={errMsg}>
                  {errMsg}
                </span>
              )}
            </div>
          );
        },
        size: 140,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tr("notifications.logColActions", "Azioni")} className="text-right justify-end" />
        ),
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(log)}
                className="h-8 w-8 p-0 hover:bg-muted/80 cursor-pointer"
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        size: 60,
      },
    ],
    [locale, t]
  );

  const table = useReactTable({
    data: logs,
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
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleCopyPayload = () => {
    if (!selectedLog) return;
    const content = JSON.stringify(selectedLog.request || selectedLog.payload || {}, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!selectedLog) return;
    const content = JSON.stringify(selectedLog.response || selectedLog.error_message || {}, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">{tr("notifications.totalLogs", "Notifiche Totali")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.sent}</p>
              <p className="text-xs text-muted-foreground font-medium">{tr("notifications.sentLogs", "Inviate con Successo")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.telegram}</p>
              <p className="text-xs text-muted-foreground font-medium">{tr("notifications.channelTelegram", "Telegram Dispatched")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stats.failed}</p>
              <p className="text-xs text-muted-foreground font-medium">{tr("notifications.failedLogs", "Errori & Bounces")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Data Table Container */}
      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder={tr("notifications.searchLogsPlaceholder", locale === "en" ? "Search by recipient or subject..." : "Cerca per destinatario o oggetto...")}
          onSearchChange={(val) => setGlobalFilter(val)}
          searchValue={globalFilter}
          filters={[
            {
              value: channelFilter,
              onChange: (val) => setChannelFilter(val),
              placeholder: tr("notifications.columnChannel", "Canale"),
              options: [
                { value: "all", label: tr("notifications.logChannelAll", "Tutti i canali") },
                { value: "email", label: "Email", icon: Mail },
                { value: "telegram", label: "Telegram", icon: MessageSquare },
              ],
            },
            {
              value: statusFilter,
              onChange: (val) => setStatusFilter(val),
              placeholder: tr("notifications.logColStatus", "Stato"),
              options: [
                { value: "all", label: tr("notifications.logStatusAll", "Tutti gli stati") },
                { value: "sent", label: getStatusLabel(NotificationStatus.SENT), icon: CheckCircle2 },
                { value: "failed", label: getStatusLabel(NotificationStatus.FAILED), icon: AlertCircle },
              ],
            },
          ]}
          onResetFilters={() => {
            setGlobalFilter("");
            setChannelFilter("all");
            setStatusFilter("all");
          }}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
              className="h-9 px-2.5 cursor-pointer text-xs"
              title={tr("common.refresh", "Aggiorna")}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1.5">{tr("common.refresh", "Aggiorna")}</span>
            </Button>
          }
        />

        <AtenaDataTable
          table={table}
          isLoading={loading}
          emptyMessage={tr("notifications.noLogsFound", "Nessun log di trasmissione registrato.")}
        />
      </div>

      {/* 3. Log Detail Dialog */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-5 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                selectedLog && Number(selectedLog.channel) === NotificationChannel.EMAIL
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
              }`}>
                {selectedLog && Number(selectedLog.channel) === NotificationChannel.EMAIL ? (
                  <Mail className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-bold">
                  {tr("notifications.logDetailTitle", locale === "en" ? "Delivery Details" : "Dettaglio Invio Notifica")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>ID:</span>
                  <code className="font-mono text-xs font-semibold text-foreground">{selectedLog?.id}</code>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Overview grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs p-3.5 bg-muted/30 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    {tr("notifications.logColDate", "Data & Ora")}
                  </span>
                  <span className="font-mono font-medium">{formatDate(selectedLog.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    {tr("notifications.columnChannel", "Canale")}
                  </span>
                  <Badge variant="outline" className="text-xs font-medium mt-0.5">
                    {getChannelLabel(Number(selectedLog.channel))}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    {tr("notifications.logColStatus", "Stato")}
                  </span>
                  <Badge
                    variant={Number(selectedLog.status) === NotificationStatus.SENT ? "outline" : "destructive"}
                    className={Number(selectedLog.status) === NotificationStatus.SENT ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1 mt-0.5" : "text-xs font-semibold gap-1 mt-0.5"}
                  >
                    {Number(selectedLog.status) === NotificationStatus.SENT ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {getStatusLabel(Number(selectedLog.status))}
                  </Badge>
                </div>

                <div className="col-span-2 sm:col-span-3 pt-1 border-t border-border/50">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                    {tr("notifications.logColRecipient", "Destinatario")}
                  </span>
                  <span className="font-mono font-semibold text-foreground truncate block text-xs mt-0.5">
                    {selectedLog.recipient}
                  </span>
                </div>

                {(selectedLog.subject || selectedLog.event_type) && (
                  <div className="col-span-2 sm:col-span-3 pt-1 border-t border-border/50">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                      {tr("notifications.logColSubject", "Oggetto / Evento")}
                    </span>
                    <span className="font-medium text-foreground block text-xs mt-0.5">
                      {selectedLog.subject || selectedLog.event_type}
                    </span>
                  </div>
                )}

                {selectedLog.notification_trigger_id && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Trigger ID</span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate block mt-0.5">
                      {selectedLog.notification_trigger_id}
                    </span>
                  </div>
                )}
                {selectedLog.notification_template_id && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Template ID</span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate block mt-0.5">
                      {selectedLog.notification_template_id}
                    </span>
                  </div>
                )}
              </div>

              {/* Webhook Events Timeline if present */}
              {Array.isArray(selectedLog.response?.webhook_events) && selectedLog.response.webhook_events.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    {tr("notifications.logSectionWebhookTimeline", "Timeline Eventi Webhook Resend")}
                  </span>
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono">
                    {selectedLog.response.webhook_events.map((evt: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-emerald-400 font-semibold">{evt.type}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(evt.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {tr("notifications.logSectionPayload", "Dati Payload (JSON)")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="h-7 px-2 text-[11px] gap-1 cursor-pointer"
                  >
                    {copiedPayload ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedPayload ? tr("common.copied", "Copiato") : tr("common.copy", "Copia")}
                  </Button>
                </div>
                <pre className="p-3 bg-muted/60 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-auto border">
                  {JSON.stringify(selectedLog.request || selectedLog.payload || {}, null, 2)}
                </pre>
              </div>

              {/* Raw JSON Response */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                    {tr("notifications.logSectionResponse", "Risposta Server / Provider")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyResponse}
                    className="h-7 px-2 text-[11px] gap-1 cursor-pointer"
                  >
                    {copiedResponse ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedResponse ? tr("common.copied", "Copiato") : tr("common.copy", "Copia")}
                  </Button>
                </div>
                <pre className="p-3 bg-muted/60 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-auto border">
                  {JSON.stringify(selectedLog.response || selectedLog.error_message || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
