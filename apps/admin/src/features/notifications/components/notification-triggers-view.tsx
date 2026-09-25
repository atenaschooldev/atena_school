"use client";

import React, { useState, useMemo, Suspense, lazy } from "react";
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
  RecipientType,
  TriggerTimingType,
  NOTIFICATION_CHANNEL_DICTIONARY,
} from "@atena/api-types";
import type { NotificationTriggerRecord } from "@atena/api-types";
import { useNotificationTriggers } from "../hooks/use-notification-triggers";
import { useNotificationTemplates } from "../hooks/use-notification-templates";
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
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { useTranslation } from "@/i18n/context";
import {
  Zap,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  Clock,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react";

const TriggerEditorDrawer = lazy(() =>
  import("./trigger-editor-drawer").then((m) => ({
    default: m.TriggerEditorDrawer,
  }))
);

export function NotificationTriggersView() {
  const { t, locale } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTriggerRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingTrigger, setDeletingTrigger] = useState<NotificationTriggerRecord | null>(null);

  const {
    triggers,
    systemEvents,
    loading,
    refresh,
    createTrigger,
    updateTrigger,
    toggleTrigger,
    deleteTrigger,
    isCreating,
    isUpdating,
  } = useNotificationTriggers();

  const { templates } = useNotificationTemplates();

  const handleOpenCreate = () => {
    setSelectedTrigger(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (trg: NotificationTriggerRecord) => {
    setSelectedTrigger(trg);
    setIsEditorOpen(true);
  };

  const handleSave = async (payload: any) => {
    if (selectedTrigger) {
      await updateTrigger(selectedTrigger.id, payload);
    } else {
      await createTrigger(payload);
    }
  };

  const handleDelete = async () => {
    if (!deletingTrigger) return;
    await deleteTrigger(deletingTrigger.id);
    setDeletingTrigger(null);
  };

  const getChannelLabel = (channel: number): string => {
    const entry = NOTIFICATION_CHANNEL_DICTIONARY[channel as keyof typeof NOTIFICATION_CHANNEL_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return channel === NotificationChannel.EMAIL ? "Email" : "Telegram";
  };

  const getRecipientLabel = (type: number): string => {
    if (type === RecipientType.CUSTOMER) return locale === "en" ? "Customer" : "Cliente";
    if (type === RecipientType.ADMIN) return locale === "en" ? "Administration" : "Segreteria";
    if (type === RecipientType.TEACHER) return locale === "en" ? "Teacher" : "Docente";
    return locale === "en" ? "Custom" : "Personalizzato";
  };

  const getEventName = (key: string): string => {
    const evt = systemEvents[key];
    if (evt) {
      if (locale === "en") return evt.label_en || evt.label_it;
      return evt.label_it;
    }
    return key;
  };

  const columns: ColumnDef<NotificationTriggerRecord>[] = useMemo(
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
        size: 90,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnName") || "Regola / Nome"} />
        ),
        cell: ({ row }) => {
          return (
            <CellAvatar
              title={row.original.name}
              subtitle={row.original.description || getEventName(row.original.event_key)}
              icon={Zap}
              badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          );
        },
        size: 260,
      },
      {
        accessorKey: "event_key",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnEvent") || "Evento Trigger"} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="text-xs font-semibold text-foreground truncate">
                {getEventName(row.original.event_key)}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                {row.original.event_key}
              </span>
            </div>
          );
        },
      },
      {
        id: "template",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnTemplate") || "Modello Collegato"} />
        ),
        cell: ({ row }) => {
          const tmpl = row.original.template;
          return (
            <div className="flex items-center gap-1.5 max-w-[220px]">
              <div className="truncate">
                <span className="text-xs font-medium text-foreground block truncate">
                  {tmpl?.name || "Modello #" + (row.original.notification_template_id || row.original.template_id)}
                </span>
                {tmpl?.code && (
                  <span className="text-[10px] font-mono text-muted-foreground block truncate">
                    {tmpl.code}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "channel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnChannel") || "Canale"} />
        ),
        cell: ({ row }) => {
          const isEmail = row.original.channel === NotificationChannel.EMAIL;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium gap-1 ${
                isEmail
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  : "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5"
              }`}
            >
              {isEmail ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
              {getChannelLabel(row.original.channel)}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "recipient_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnRecipient") || "Destinatario"} />
        ),
        cell: ({ row }) => {
          const isCustomer = row.original.recipient_type === RecipientType.CUSTOMER;
          const isTeacher = row.original.recipient_type === RecipientType.TEACHER;
          const isCustom = row.original.recipient_type === 4;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                isCustomer
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  : isTeacher
                  ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                  : isCustom
                  ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                  : "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
              }`}
            >
              {isCustom ? row.original.custom_recipient || "Personalizzato" : getRecipientLabel(row.original.recipient_type)}
            </Badge>
          );
        },
        size: 140,
      },
      {
        id: "timing",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnTiming") || "Tempistica"} />
        ),
        cell: ({ row }) => {
          const isDelayed =
            row.original.timing_type === TriggerTimingType.DELAYED ||
            (row.original.timing_type as any) === "delayed";
          return (
            <Badge variant="outline" className="text-[11px] font-mono border-border/60 gap-1">
              {isDelayed ? (
                <>
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>+{Math.round(row.original.delay_seconds / 60)}m</span>
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 text-emerald-500" />
                  <span>Immediato</span>
                </>
              )}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("common.status") || "Stato"} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={row.original.is_active}
                onCheckedChange={(val) => toggleTrigger(row.original.id, val)}
                className="scale-80 cursor-pointer data-[state=checked]:bg-emerald-600"
                aria-label={row.original.is_active ? "Attivo" : "Disattivo"}
              />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {row.original.is_active ? "Attivo" : "Inattivo"}
              </span>
            </div>
          );
        },
        size: 110,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Azioni</span>,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end gap-1 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEdit(row.original)}
                title={t("common.edit") || "Modifica"}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeletingTrigger(row.original)}
                title={t("common.delete") || "Elimina"}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
        size: 90,
      },
    ],
    [locale, t, systemEvents]
  );

  const table = useReactTable({
    data: triggers,
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
      const trg = row.original;
      return (
        trg.name.toLowerCase().includes(q) ||
        trg.event_key.toLowerCase().includes(q) ||
        (trg.description && trg.description.toLowerCase().includes(q)) ||
        (trg.template?.name && trg.template.name.toLowerCase().includes(q)) ||
        String(trg.id).includes(q)
      );
    },
  });

  const totalTriggers = triggers.length;
  const activeTriggers = triggers.filter((t) => t.is_active).length;
  const emailTriggers = triggers.filter((t) => t.channel === NotificationChannel.EMAIL).length;
  const telegramTriggers = triggers.filter((t) => t.channel === NotificationChannel.TELEGRAM).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{totalTriggers}</p>
              <p className="text-xs text-muted-foreground font-medium">{t("notifications.statTotalRules") || "Regole Totali"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{activeTriggers}</p>
              <p className="text-xs text-muted-foreground font-medium">{t("notifications.statActiveRules") || "Regole Attive"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{emailTriggers}</p>
              <p className="text-xs text-muted-foreground font-medium">{t("notifications.channelEmail") || "Email Triggers"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{telegramTriggers}</p>
              <p className="text-xs text-muted-foreground font-medium">{t("notifications.channelTelegram") || "Telegram Triggers"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Data Table Container */}
      <div className="space-y-4">
        <DataTableToolbar
          table={table}
          searchPlaceholder={t("notifications.searchTriggersPlaceholder") || "Cerca per nome regola, evento o template..."}
          onSearchChange={(val) => setGlobalFilter(val)}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refresh()}
                disabled={loading}
                className="h-9 px-2.5 cursor-pointer text-xs"
                title={t("common.refresh") || "Aggiorna"}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-1.5">{t("common.refresh") || "Aggiorna"}</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCreate}
                className="h-9 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("notifications.createTriggerBtn") || "Nuova Regola"}</span>
              </Button>
            </div>
          }
        />

        <AtenaDataTable
          table={table}
          isLoading={loading}
          emptyMessage={t("notifications.noTriggersFound") || "Nessuna regola di automazione trovata."}
        />
      </div>

      {/* 3. Trigger Drawer Editor */}
      {isEditorOpen && (
        <Suspense fallback={null}>
          <TriggerEditorDrawer
            trigger={selectedTrigger}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
            isLoading={isCreating || isUpdating}
          />
        </Suspense>
      )}

      {/* 4. Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTrigger} onOpenChange={(open) => !open && setDeletingTrigger(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t("notifications.deleteTriggerTitle") || "Eliminare Regola di Notifica?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground mt-2">
              {t("notifications.deleteTriggerConfirm") ||
                `Sei sicuro di voler eliminare la regola "${deletingTrigger?.name}"? Le notifiche automatiche associate a questo evento non verranno più inviate.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-xs">{t("common.cancel") || "Annulla"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
            >
              {t("common.delete") || "Elimina Definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
