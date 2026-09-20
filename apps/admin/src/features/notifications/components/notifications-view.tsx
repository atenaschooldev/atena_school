"use client";

import React, { useState, useMemo } from "react";
import {
  NotificationChannel,
  RecipientType,
} from "../types";
import type {
  NotificationTemplateRecord,
  UpdateNotificationTemplateDto,
} from "../types";
import { useNotificationTemplates } from "../hooks/use-notification-templates";
import { TemplateEditorDrawer } from "./template-editor-drawer";
import { TestSendModal } from "./test-send-modal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";
import {
  Mail,
  MessageSquare,
  Send,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Layers,
} from "lucide-react";

export function NotificationsView() {
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [testingTemplate, setTestingTemplate] = useState<NotificationTemplateRecord | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const {
    templates,
    loading,
    refresh,
    updateTemplate,
    testSend,
    isUpdating,
    isTesting,
  } = useNotificationTemplates();

  // Metrics computation
  const metrics = useMemo(() => {
    const total = templates.length;
    const customerEmails = templates.filter(
      (t) => t.channel === NotificationChannel.EMAIL && t.recipient_type === RecipientType.CUSTOMER
    ).length;
    const adminEmails = templates.filter(
      (t) => t.channel === NotificationChannel.EMAIL && t.recipient_type === RecipientType.ADMIN
    ).length;
    const telegrams = templates.filter((t) => t.channel === NotificationChannel.TELEGRAM).length;
    const activeCount = templates.filter((t) => t.is_active).length;

    return { total, customerEmails, adminEmails, telegrams, activeCount };
  }, [templates]);

  // Filtering
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      // Category Tab filter
      if (selectedCategory === "customer_email") {
        if (item.channel !== NotificationChannel.EMAIL || item.recipient_type !== RecipientType.CUSTOMER) {
          return false;
        }
      } else if (selectedCategory === "admin_email") {
        if (item.channel !== NotificationChannel.EMAIL || item.recipient_type !== RecipientType.ADMIN) {
          return false;
        }
      } else if (selectedCategory === "telegram") {
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
  }, [templates, selectedCategory, statusFilter, searchQuery]);

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

  const handleSaveTemplate = async (id: string, payload: UpdateNotificationTemplateDto) => {
    await updateTemplate(id, payload);
    setIsEditorOpen(false);
  };

  const handleTestSend = async ({ recipient }: { recipient: string }) => {
    if (!testingTemplate) return;
    await testSend(testingTemplate.id, { recipient });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-muted/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("notifications.totalTemplates") || "Template Totali"}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{metrics.total}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeCount} {t("notifications.activeCount") || "Attivi"}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabCustomerEmail") || "Email Clienti"}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{metrics.customerEmails}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Conferme & Ricevute
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabAdminEmail") || "Email Segreteria"}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{metrics.adminEmails}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                Alerte Prenotazioni & Lead
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabTelegram") || "Telegram Bot"}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{metrics.telegrams}</h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium">
                Notifiche Istantanee Canale
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
              <MessageSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <Card className="border-muted/80 shadow-sm">
        <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Category Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs">
                {t("notifications.tabAll") || "Tutti"}
              </TabsTrigger>
              <TabsTrigger value="customer_email" className="text-xs">
                {t("notifications.tabCustomerEmail") || "Email Clienti"}
              </TabsTrigger>
              <TabsTrigger value="admin_email" className="text-xs">
                {t("notifications.tabAdminEmail") || "Email Segreteria"}
              </TabsTrigger>
              <TabsTrigger value="telegram" className="text-xs">
                {t("notifications.tabTelegram") || "Telegram Bot"}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Status Filter Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={
                  t("notifications.searchPlaceholder") || "Cerca template..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder={t("common.filter") || "Stato"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("notifications.statusFilterAll") || "Tutti gli stati"}</SelectItem>
                <SelectItem value="active">{t("notifications.statusFilterActive") || "Solo Attivi"}</SelectItem>
                <SelectItem value="inactive">{t("notifications.statusFilterInactive") || "Solo Disattivi"}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => refresh()}
              title={t("common.refresh") || "Aggiorna"}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-muted rounded-full text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">
                {t("notifications.noTemplatesFound") || "Nessun template trovato"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Prova a modificare i filtri di ricerca o la categoria selezionata.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const isEmail = template.channel === NotificationChannel.EMAIL;
            const isCustomer = template.recipient_type === RecipientType.CUSTOMER;

            return (
              <Card
                key={template.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border-muted/80 overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={isEmail ? "default" : "secondary"}
                        className="gap-1 text-[11px] py-0.5"
                      >
                        {isEmail ? <Mail className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                        {isEmail ? "Email" : "Telegram"}
                      </Badge>

                      <Badge variant="outline" className="text-[11px] py-0.5">
                        {isCustomer
                          ? t("notifications.recipientCustomer") || "Cliente"
                          : t("notifications.recipientAdmin") || "Amministrazione"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {template.is_active ? "Attivo" : "Off"}
                      </span>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(val) => handleToggleStatus(template, val)}
                        aria-label="Attiva template"
                      />
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {template.name}
                    </CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {template.code}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-3 flex-1 space-y-3">
                  {template.description && (
                    <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                      {template.description}
                    </CardDescription>
                  )}

                  {isEmail && template.subject_template && (
                    <div className="p-2.5 rounded-lg bg-muted/40 border text-xs space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Oggetto:
                      </span>
                      <p className="font-mono text-xs text-foreground truncate">
                        {template.subject_template}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>
                        {(template.available_variables || []).length} variabili dinamiche
                      </span>
                    </div>

                    <span className="text-[11px]">
                      {new Date(template.updated_at).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t bg-muted/10 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8"
                    onClick={() => handleOpenTest(template)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("notifications.testSendBtn") || "Invia Test"}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8"
                    onClick={() => handleOpenEdit(template)}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {t("notifications.editTemplate") || "Modifica"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Side Drawer */}
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
