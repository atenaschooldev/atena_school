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
  RecipientType,
  NOTIFICATION_TYPE_DICTIONARY,
  NOTIFICATION_CHANNEL_DICTIONARY,
  RECIPIENT_TYPE_DICTIONARY,
} from "@atena/api-types";
import type {
  NotificationTemplateRecord,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from "../types";
import { useNotificationTemplates } from "../hooks/use-notification-templates";
import { TemplateEditorDrawer } from "./template-editor-drawer";
import { CreateTemplateDialog } from "./create-template-dialog";
import { TestSendModal } from "./test-send-modal";
import { NotificationLogsView } from "./notification-logs-view";
import { NotificationTriggersView } from "./notification-triggers-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { AtenaDataTable } from "@/components/shared/data-table/atena-data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { CellAvatar } from "@/components/shared/data-table/cells/cell-avatar";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTranslation } from "@/i18n/context";
import {
  Mail,
  MessageSquare,
  Send,
  Pencil,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Bell,
  Zap,
} from "lucide-react";

export function NotificationsView() {
  const { t, locale } = useTranslation();

  function getNotificationTypeLabel(val: unknown): string {
    const num = Number(val);
    const entry = NOTIFICATION_TYPE_DICTIONARY[num as keyof typeof NOTIFICATION_TYPE_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    if (typeof val === "string") {
      const byCode = Object.values(NOTIFICATION_TYPE_DICTIONARY).find(
        (e) => e.code.toLowerCase() === val.toLowerCase()
      );
      if (byCode) {
        if (locale === "en") return byCode.label_en || byCode.label_it;
        return byCode.label_it;
      }
    }
    return String(val || "—");
  }

  function getChannelLabel(channel: number): string {
    const entry = NOTIFICATION_CHANNEL_DICTIONARY[channel as keyof typeof NOTIFICATION_CHANNEL_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return channel === NotificationChannel.EMAIL ? "Email" : "Telegram";
  }

  function getRecipientLabel(recipientType: number): string {
    const entry = RECIPIENT_TYPE_DICTIONARY[recipientType as keyof typeof RECIPIENT_TYPE_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    if (recipientType === RecipientType.CUSTOMER) return "Cliente";
    if (recipientType === RecipientType.TEACHER) return "Insegnante";
    return "Segreteria";
  }

  const [activeTab, setActiveTab] = useState<"templates" | "triggers" | "logs">("templates");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [testingTemplate, setTestingTemplate] = useState<NotificationTemplateRecord | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const {
    templates,
    loading,
    refresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testSend,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
  } = useNotificationTemplates();

  const metricsData = useMemo(() => {
    const total = templates.length;
    const customerEmails = templates.filter(
      (t) => t.channel === NotificationChannel.EMAIL && t.recipient_type === RecipientType.CUSTOMER
    ).length;
    const adminEmails = templates.filter(
      (t) => t.channel === NotificationChannel.EMAIL && t.recipient_type === RecipientType.ADMIN
    ).length;
    const telegrams = templates.filter((t) => t.channel === NotificationChannel.TELEGRAM).length;
    const activeCount = templates.filter((t) => t.is_active).length;

    return [
      {
        title: t("notifications.metricTotalTemplates") || "Totale Modelli",
        value: total,
        description: `${activeCount} ${t("notifications.metricActiveCount") || "attivi nel sistema"}`,
        icon: Layers,
      },
      {
        title: t("notifications.metricCustomerEmails") || "Email Clienti",
        value: customerEmails,
        description: t("notifications.metricCustomerEmailsDesc") || "Conferme, promemoria, tessere",
        icon: UserCheck,
      },
      {
        title: t("notifications.metricAdminEmails") || "Notifiche Segreteria",
        value: adminEmails,
        description: t("notifications.metricAdminEmailsDesc") || "Avvisi prenotazioni e lead",
        icon: ShieldCheck,
      },
      {
        title: t("notifications.metricTelegram") || "Canale Telegram",
        value: telegrams,
        description: t("notifications.metricTelegramDesc") || "Messaggi istantanei su bot",
        icon: Sparkles,
      },
    ];
  }, [templates, t]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tmpl.name.toLowerCase().includes(q);
        const matchCode = tmpl.code.toLowerCase().includes(q);
        const matchSubject = tmpl.subject_template?.toLowerCase().includes(q) || false;
        if (!matchName && !matchCode && !matchSubject) return false;
      }

      if (categoryFilter !== "all") {
        if (categoryFilter === "customer_email") {
          if (tmpl.channel !== NotificationChannel.EMAIL || tmpl.recipient_type !== RecipientType.CUSTOMER) return false;
        } else if (categoryFilter === "admin_email") {
          if (tmpl.channel !== NotificationChannel.EMAIL || tmpl.recipient_type !== RecipientType.ADMIN) return false;
        } else if (categoryFilter === "telegram") {
          if (tmpl.channel !== NotificationChannel.TELEGRAM) return false;
        }
      }

      if (statusFilter !== "all") {
        if (statusFilter === "active" && !tmpl.is_active) return false;
        if (statusFilter === "inactive" && tmpl.is_active) return false;
      }

      return true;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  const handleOpenEdit = (tmpl: NotificationTemplateRecord) => {
    setEditingTemplate(tmpl);
    setIsEditorOpen(true);
  };

  const handleOpenTest = (tmpl: NotificationTemplateRecord) => {
    setTestingTemplate(tmpl);
    setIsTestModalOpen(true);
  };

  const handleCreateTemplate = async (dto: CreateNotificationTemplateDto) => {
    const created = await createTemplate(dto);
    if (created) {
      setIsCreateOpen(false);
      setEditingTemplate(created);
      setIsEditorOpen(true);
    }
  };

  const handleToggleStatus = async (template: NotificationTemplateRecord, newActive: boolean) => {
    await updateTemplate(template.id, { is_active: newActive });
  };

  const handleDeleteTemplate = async (template: NotificationTemplateRecord) => {
    const SYSTEM_CODES = [
      "booking_confirmation_client",
      "booking_alert_admin",
      "contact_lead_admin",
      "membership_card_client",
      "payment_reminder_client",
    ];

    if (SYSTEM_CODES.includes(template.code)) {
      alert(
        t("notifications.cannotDeleteSystemTemplate") ||
          `Il modello "${template.name}" è un template di sistema fondamentale e non può essere eliminato.`
      );
      return;
    }

    const confirmed = window.confirm(
      (t("notifications.deleteConfirm") || "Sei sicuro di voler eliminare il modello '{name}'? Verranno eliminati anche i trigger associati.")
        .replace("{name}", template.name)
    );
    if (!confirmed) return;
    await deleteTemplate(template.id);
  };

  const handleSaveTemplate = async (id: string, payload: UpdateNotificationTemplateDto) => {
    await updateTemplate(id, payload);
    setIsEditorOpen(false);
  };

  const handleTestSend = async ({ recipient }: { recipient: string }) => {
    if (!testingTemplate) return;
    await testSend(testingTemplate.id, { recipient });
  };

  const columns: ColumnDef<NotificationTemplateRecord>[] = useMemo(
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
        size: 110,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnName") || "Nome Template"} />
        ),
        cell: ({ row }) => {
          const isEmail = row.original.channel === NotificationChannel.EMAIL;
          return (
            <CellAvatar
              title={row.original.name}
              subtitle={row.original.code}
              icon={isEmail ? Mail : MessageSquare}
              badgeColor="bg-primary/10 text-primary"
            />
          );
        },
      },
      {
        accessorKey: "channel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnChannel") || "Canale"} />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="outline" className="text-xs font-medium border-border/60">
              {getChannelLabel(row.original.channel)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "recipient_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnRecipient") || "Destinatario"} />
        ),
        cell: ({ row }) => {
          const isCustomer = row.original.recipient_type === RecipientType.CUSTOMER;
          const isTeacher = row.original.recipient_type === RecipientType.TEACHER;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                isCustomer
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                  : isTeacher
                  ? "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5"
                  : "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
              }`}
            >
              {getRecipientLabel(row.original.recipient_type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "notification_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("notifications.columnEventType") || "Tipo Evento"} />
        ),
        cell: ({ row }) => {
          return (
            <span className="text-xs font-medium text-foreground truncate">
              {getNotificationTypeLabel(row.original.notification_type)}
            </span>
          );
        },
      },
      {
        id: "subject",
        header: () => (
          <span className="text-xs font-medium text-muted-foreground">
            {t("notifications.columnSubject") || "Oggetto / Dettagli"}
          </span>
        ),
        cell: ({ row }) => {
          const text = row.original.subject_template || row.original.description || "—";
          return (
            <div className="max-w-[280px] truncate text-xs text-muted-foreground font-mono">
              {text}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("common.status")} />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <StatusBadge status={row.original.is_active ? "attivo" : "archived"} />
              <Switch
                checked={row.original.is_active}
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
        header: () => (
          <div className="text-right text-xs font-medium text-muted-foreground">
            {t("common.actions")}
          </div>
        ),
        enableHiding: false,
        cell: ({ row }) => {
          const tmpl = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => handleOpenTest(tmpl)}
                title={t("notifications.sendTest") || "Invia test"}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg"
                onClick={() => handleOpenEdit(tmpl)}
                title={t("notifications.editTemplate") || "Modifica template"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-rose-600/70 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg dark:hover:text-rose-400 transition-colors"
                onClick={() => handleDeleteTemplate(tmpl)}
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
    [t, isUpdating, isDeleting, locale]
  );

  const table = useReactTable({
    data: filteredTemplates,
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

  const channelOptions = [
    { value: "all", label: t("notifications.tabAll") || "Tutti i Canali" },
    { value: "customer_email", label: `${getChannelLabel(NotificationChannel.EMAIL)} (${getRecipientLabel(RecipientType.CUSTOMER)})` },
    { value: "admin_email", label: `${getChannelLabel(NotificationChannel.EMAIL)} (${getRecipientLabel(RecipientType.ADMIN)})` },
    { value: "telegram", label: getChannelLabel(NotificationChannel.TELEGRAM) },
  ];

  const statusOptions = [
    { value: "all", label: t("notifications.statusFilterAll") || "Tutti gli stati" },
    { value: "active", label: t("notifications.statusFilterActive") || "Attivo" },
    { value: "inactive", label: t("notifications.statusFilterInactive") || "Disattivo" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Navigation Tabs (Templates vs Triggers vs Live Logs) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3 flex-wrap gap-3">
        <div className="flex rounded-xl bg-muted/50 p-1 border border-border/60 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            {t("notifications.tabTemplates") || "Modelli Notifiche"} ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("triggers")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "triggers"
                ? "bg-background shadow-xs text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-4 w-4 text-amber-500" />
            {t("notifications.tabTriggers") || "Regole & Trigger"}
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
            <Bell className="h-4 w-4 text-sky-500" />
            {t("notifications.tabLogs") || "Registro Invii & Log"}
          </button>
        </div>
      </div>

      {activeTab === "logs" ? (
        <div className="@container/main px-4 lg:px-6">
          <NotificationLogsView />
        </div>
      ) : activeTab === "triggers" ? (
        <div className="@container/main px-4 lg:px-6">
          <NotificationTriggersView />
        </div>
      ) : (
        <>
          {/* ── Top Metrics ── */}
          <div className="@container/main px-4 lg:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricsData.map((metric, index) => (
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
                      <div className="text-muted-foreground text-xs mt-0.5">{metric.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Main Toolbar & Content Container ── */}
          <div className="@container/main px-4 lg:px-6 space-y-4">
            <DataTableToolbar
              table={table}
              searchKey="name"
              searchPlaceholder={t("notifications.searchPlaceholder") || "Cerca per nome, codice o oggetto..."}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterKey="is_active"
              filterTitle={t("common.status")}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={statusOptions}
              actionButton={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 px-3 cursor-pointer text-xs font-semibold gap-1.5 shadow-xs rounded-lg"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t("notifications.createTemplateBtn") || "Nuovo Modello"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 cursor-pointer text-xs font-medium rounded-lg border-border/60 hover:bg-muted/80"
                    onClick={() => refresh()}
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>{t("common.refresh") || "Aggiorna"}</span>
                  </Button>
                </div>
              }
            />

            <AtenaDataTable
              table={table}
              columns={columns}
              loading={loading}
              emptyMessage={t("notifications.noTemplatesFound") || "Nessun template trovato."}
            />
          </div>
        </>
      )}

      {/* Create New Template Dialog */}
      <CreateTemplateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTemplate}
        isLoading={isCreating}
      />

      {/* Editor & Visual Builder Modal */}
      <TemplateEditorDrawer
        template={editingTemplate}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTemplate}
        onOpenTestModal={(tmpl) => {
          setTestingTemplate(tmpl);
          setIsTestModalOpen(true);
        }}
        isLoading={isUpdating}
      />

      {/* Test Send Modal */}
      <TestSendModal
        template={testingTemplate}
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onSendTest={handleTestSend}
        isLoading={isTesting}
      />
    </div>
  );
}
