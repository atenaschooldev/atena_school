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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { useTranslation } from "@/i18n/context";
import {
  Mail,
  MessageSquare,
  Send,
  Pencil,
  Plus,
  Trash2,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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

  // Metrics computation (styled strictly like CoursesMetrics)
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
        title: t("notifications.totalTemplates") || "Template Totali",
        value: total,
        description: `${activeCount} ${t("notifications.metricsActiveInSystem") || "attivi nel sistema"}`,
        icon: Layers,
      },
      {
        title: t("notifications.tabCustomerEmail") || "Email Clienti",
        value: customerEmails,
        description: t("notifications.metricsCustomerEmailDesc") || "Conferme iscrizioni & ricevute",
        icon: UserCheck,
      },
      {
        title: t("notifications.tabAdminEmail") || "Email Segreteria",
        value: adminEmails,
        description: t("notifications.metricsAdminEmailDesc") || "Alerte nuove iscrizioni & lead",
        icon: ShieldCheck,
      },
      {
        title: t("notifications.tabTelegram") || "Telegram Bot",
        value: telegrams,
        description: t("notifications.metricsTelegramDesc") || "Messaggi istantanei su canale",
        icon: MessageSquare,
      },
    ];
  }, [templates, t]);

  // Filtering
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      // Channel / Recipient Filter
      if (categoryFilter === "customer_email") {
        if (item.channel !== NotificationChannel.EMAIL || item.recipient_type !== RecipientType.CUSTOMER) {
          return false;
        }
      } else if (categoryFilter === "admin_email") {
        if (item.channel !== NotificationChannel.EMAIL || item.recipient_type !== RecipientType.ADMIN) {
          return false;
        }
      } else if (categoryFilter === "telegram") {
        if (item.channel !== NotificationChannel.TELEGRAM) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && !item.is_active) return false;
      if (statusFilter === "inactive" && item.is_active) return false;

      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        const matchesSubject = item.subject_template
          ? item.subject_template.toLowerCase().includes(q)
          : false;
        if (!matchesName && !matchesCode && !matchesDesc && !matchesSubject) return false;
      }

      return true;
    });
  }, [templates, categoryFilter, statusFilter, searchQuery]);

  const handleOpenEdit = (template: NotificationTemplateRecord) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleOpenTest = (template: NotificationTemplateRecord) => {
    setTestingTemplate(template);
    setIsTestModalOpen(true);
  };

  const handleToggleStatus = async (template: NotificationTemplateRecord, newStatus: boolean) => {
    await updateTemplate(template.id, { is_active: newStatus });
  };

  const handleCreateTemplate = async (dto: CreateNotificationTemplateDto) => {
    const created = await createTemplate(dto);
    if (created) {
      setEditingTemplate(created);
      setIsEditorOpen(true);
    }
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

  // Table Columns Definition matching CoursesTableColumns
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
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 cursor-pointer font-semibold text-xs text-muted-foreground hover:bg-accent/50"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>{t("notifications.columnName") || "Nome Template"}</span>
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
          const isEmail = row.original.channel === NotificationChannel.EMAIL;
          return (
            <div className="flex items-center gap-3 min-w-[220px]">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                {isEmail ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-sm text-foreground truncate">{row.original.name}</span>
                <span className="text-xs text-muted-foreground font-mono truncate">{row.original.code}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "channel",
        header: t("notifications.columnChannel") || "Canale",
        cell: ({ row }) => {
          return (
            <Badge variant="outline" className="text-xs font-medium">
              {getChannelLabel(row.original.channel)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "recipient_type",
        header: t("notifications.columnRecipient") || "Destinatario",
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
        header: t("notifications.columnEventType") || "Tipo Evento",
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
        header: t("notifications.columnSubject") || "Oggetto / Dettagli",
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
        header: t("notifications.columnStatus") || t("common.status") || "Stato",
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
        header: t("notifications.columnActions") || t("common.actions") || "Azioni",
        enableHiding: false,
        cell: ({ row }) => {
          const tmpl = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenTest(tmpl)}
                title={t("notifications.sendTest") || "Invia test"}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEdit(tmpl)}
                title={t("notifications.editTemplate") || "Modifica template"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUpdating, t, locale]
  );

  const table = useReactTable({
    data: filteredTemplates,
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
      {/* ── Top Navigation Tabs (Templates vs Triggers vs Live Logs) ── */}
      <div className="px-4 lg:px-6 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-muted/50 p-1 border">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "templates"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              {t("notifications.tabTemplates") || "Modelli Notifiche"} ({templates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("triggers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "triggers"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              {t("notifications.tabTriggers") || "Regole & Trigger"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-background shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4 text-sky-500" />
              {t("notifications.tabLogs") || "Registro Invii & Log"}
            </button>
          </div>
        </div>
      </div>

      {activeTab === "logs" ? (
        <div className="px-4 lg:px-6">
          <NotificationLogsView />
        </div>
      ) : activeTab === "triggers" ? (
        <div className="px-4 lg:px-6">
          <NotificationTriggersView />
        </div>
      ) : (
        <>
          {/* ── Top Metrics (Strictly matching CoursesMetrics design) ── */}
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
          searchPlaceholder={t("notifications.searchPlaceholder") || "Cerca per nome, codice o oggetto..."}
          filters={[
            {
              value: categoryFilter,
              onChange: setCategoryFilter,
              placeholder: t("notifications.columnChannel") || "Canale",
              options: [
                { value: "all", label: t("notifications.tabAll") || "Tutti i Canali" },
                { value: "customer_email", label: `${getChannelLabel(NotificationChannel.EMAIL)} (${getRecipientLabel(RecipientType.CUSTOMER)})` },
                { value: "admin_email", label: `${getChannelLabel(NotificationChannel.EMAIL)} (${getRecipientLabel(RecipientType.ADMIN)})` },
                { value: "telegram", label: getChannelLabel(NotificationChannel.TELEGRAM) },
              ],
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: t("common.status") || "Stato",
              options: [
                { value: "all", label: t("notifications.statusFilterAll") || "Tutti gli stati" },
                { value: "active", label: t("notifications.statusFilterActive") || "Attivo" },
                { value: "inactive", label: t("notifications.statusFilterInactive") || "Disattivo" },
              ],
            },
          ]}
          actionElement={
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 cursor-pointer text-xs font-bold gap-1.5 shadow-xs"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("notifications.createTemplateBtn") || "Nuovo Modello"}
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
                  <TableSkeletonRows columnsCount={columns.length} rowCount={7} />
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
                      {t("notifications.noTemplatesFound") || "Nessun template trovato."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination table={table} />
        </div>
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
