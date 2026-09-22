"use client";

import React, { useState } from "react";
import { useNotificationLogs } from "../hooks/use-notification-templates";
import {
  NotificationChannel,
  NotificationStatus,
  NOTIFICATION_CHANNEL_DICTIONARY,
  NOTIFICATION_STATUS_DICTIONARY,
} from "@atena/api-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function NotificationLogsView() {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { logs, total, limit, loading, refresh } = useNotificationLogs({
    page,
    limit: 20,
    channel: channelFilter,
    status: statusFilter,
    search: search.trim() || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function getChannelLabel(channel: number): string {
    const entry = NOTIFICATION_CHANNEL_DICTIONARY[channel as keyof typeof NOTIFICATION_CHANNEL_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return channel === NotificationChannel.EMAIL ? "Email" : "Telegram";
  }

  function getStatusLabel(status: number): string {
    const entry = NOTIFICATION_STATUS_DICTIONARY[status as keyof typeof NOTIFICATION_STATUS_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return status === NotificationStatus.SENT ? "Inviato" : "Fallito";
  }

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

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("notifications.searchLogsPlaceholder") || "Cerca per destinatario o oggetto..."}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Channel Filter */}
            <div className="flex rounded-lg border bg-muted/30 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setChannelFilter(undefined);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  channelFilter === undefined ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("notifications.logChannelAll") || "Tutti"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannelFilter(NotificationChannel.EMAIL);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  channelFilter === NotificationChannel.EMAIL ? "bg-background shadow-xs text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-3 w-3" /> {getChannelLabel(NotificationChannel.EMAIL)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannelFilter(NotificationChannel.TELEGRAM);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  channelFilter === NotificationChannel.TELEGRAM ? "bg-background shadow-xs text-sky-600 dark:text-sky-400 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3 w-3" /> {getChannelLabel(NotificationChannel.TELEGRAM)}
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex rounded-lg border bg-muted/30 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(undefined);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === undefined ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("notifications.logStatusAll") || "Stato: Tutti"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(NotificationStatus.SENT);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all text-emerald-600 dark:text-emerald-400 cursor-pointer ${
                  statusFilter === NotificationStatus.SENT ? "bg-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {getStatusLabel(NotificationStatus.SENT)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(NotificationStatus.FAILED);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all text-rose-600 dark:text-rose-400 cursor-pointer ${
                  statusFilter === NotificationStatus.FAILED ? "bg-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {getStatusLabel(NotificationStatus.FAILED)}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
              className="h-9 px-2.5 cursor-pointer"
              title={t("common.refresh") || "Ricarica"}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[170px] text-xs font-semibold">{t("notifications.logColDate") || "Data / Ora"}</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">{t("notifications.logColChannel") || "Canale"}</TableHead>
                <TableHead className="text-xs font-semibold">{t("notifications.logColRecipient") || "Destinatario"}</TableHead>
                <TableHead className="text-xs font-semibold">{t("notifications.logColSubject") || "Oggetto / Titolo"}</TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-center">{t("notifications.logColStatus") || "Stato"}</TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-right">{t("notifications.logColActions") || "Azioni"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    {t("common.loading") || "Caricamento..."}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {t("notifications.noLogsFound") || "Nessun log registrato."}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isEmail = Number(log.channel) === NotificationChannel.EMAIL;
                  const isSuccess = Number(log.status) === NotificationStatus.SENT;
                  const lastEvent = log.response?.last_event;

                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {isEmail ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              <Mail className="h-3.5 w-3.5" /> {getChannelLabel(NotificationChannel.EMAIL)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                              <MessageSquare className="h-3.5 w-3.5" /> {getChannelLabel(NotificationChannel.TELEGRAM)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-foreground max-w-[220px] truncate">
                        {log.recipient}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                        {log.subject || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1">
                          {isSuccess ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-semibold gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {getStatusLabel(NotificationStatus.SENT)}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[11px] font-semibold gap-1">
                              <AlertCircle className="h-3 w-3" /> {getStatusLabel(NotificationStatus.FAILED)}
                            </Badge>
                          )}
                          {lastEvent && (
                            <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0">
                              {lastEvent.replace("email.", "")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 w-7 p-0 cursor-pointer"
                          title={t("notifications.logColActions") || "Dettagli"}
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            {t("notifications.totalTemplates") || "Totale"}: <strong className="text-foreground">{total}</strong> {t("notifications.tabLogs") || "notifiche"}
          </div>
          <div className="flex items-center gap-2">
            <span>
              {(t("notifications.logPageOf") || "Pagina {page} di {total}")
                .replace("{page}", String(page))
                .replace("{total}", String(totalPages))}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {selectedLog && Number(selectedLog.channel) === NotificationChannel.EMAIL ? (
                  <Mail className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </div>
              <DialogTitle>{t("notifications.logDetailTitle") || "Dettagli Notifica"}</DialogTitle>
            </div>
            <DialogDescription>
              ID: <code className="font-mono text-xs">{selectedLog?.id}</code>
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 overflow-y-auto pr-1">
              {/* Overview grid */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-muted/40 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("notifications.logColDate") || "Data & Ora"}</span>
                  <span className="font-mono font-medium">{formatDate(selectedLog.created_at)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("notifications.logColRecipient") || "Destinatario"}</span>
                  <span className="font-mono font-medium truncate block">{selectedLog.recipient}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">{t("notifications.columnSubject") || "Oggetto"}</span>
                  <span className="font-medium text-foreground">{selectedLog.subject || "—"}</span>
                </div>
                {selectedLog.notification_trigger_id && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Trigger ID</span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate block">{selectedLog.notification_trigger_id}</span>
                  </div>
                )}
                {selectedLog.notification_template_id && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Template ID</span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate block">{selectedLog.notification_template_id}</span>
                  </div>
                )}
              </div>

              {/* Webhook Events Timeline if present */}
              {Array.isArray(selectedLog.response?.webhook_events) && selectedLog.response.webhook_events.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {t("notifications.logSectionWebhookTimeline") || "Timeline Eventi Webhook Resend"}
                  </span>
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono">
                    {selectedLog.response.webhook_events.map((evt: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-1 last:border-0 last:pb-0">
                        <span className="text-emerald-400 font-bold">{evt.type}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(evt.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {t("notifications.logSectionPayload") || "Dati Payload (JSON)"}
                </span>
                <pre className="p-3 bg-muted rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-auto border">
                  {JSON.stringify(selectedLog.request, null, 2)}
                </pre>
              </div>

              {/* Raw JSON Response */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {t("notifications.logSectionResponse") || "Risposta Server / Provider"}
                </span>
                <pre className="p-3 bg-muted rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-auto border">
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
