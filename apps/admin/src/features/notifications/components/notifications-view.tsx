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
import { TemplateDetailModal } from "./template-detail-modal";
import { TemplatePreviewFrame } from "./template-preview-card";
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
  Eye,
  LayoutGrid,
  ListFilter,
  Maximize2,
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

  const [previewingTemplate, setPreviewingTemplate] = useState<NotificationTemplateRecord | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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

  const handleOpenFullPreview = (template: NotificationTemplateRecord) => {
    setPreviewingTemplate(template);
    setIsPreviewModalOpen(true);
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
      {/* ── Top Hero Stats with Rich Gradients ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex items-center justify-between relative">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("notifications.totalTemplates") || "Template Totali"}
              </p>
              <h3 className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">
                {metrics.total}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {metrics.activeCount} {t("notifications.activeCount") || "Attivi"}
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-primary/15 rounded-2xl text-primary shadow-xs border border-primary/20">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xs hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex items-center justify-between relative">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabCustomerEmail") || "Email Clienti"}
              </p>
              <h3 className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">
                {metrics.customerEmails}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                Conferme iscrizioni & ricevute
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500/15 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/20">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-xs hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex items-center justify-between relative">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabAdminEmail") || "Email Segreteria"}
              </p>
              <h3 className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">
                {metrics.adminEmails}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                Alerte nuove iscrizioni & lead
              </p>
            </div>
            <div className="p-3.5 bg-blue-500/15 rounded-2xl text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-sky-500/5 shadow-xs hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex items-center justify-between relative">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("notifications.tabTelegram") || "Telegram Bot"}
              </p>
              <h3 className="text-3xl font-extrabold mt-1 text-foreground tracking-tight">
                {metrics.telegrams}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                Messaggi istantanei su canale
              </p>
            </div>
            <div className="p-3.5 bg-sky-500/15 rounded-2xl text-sky-600 dark:text-sky-400 shadow-xs border border-sky-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Bar & Actions ── */}
      <Card className="border-border/50 shadow-xs bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Category Tabs */}
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto p-1 bg-muted/60">
              <TabsTrigger value="all" className="text-xs font-semibold rounded-lg">
                {t("notifications.tabAll") || "Tutti"} ({metrics.total})
              </TabsTrigger>
              <TabsTrigger value="customer_email" className="text-xs font-semibold rounded-lg">
                {t("notifications.tabCustomerEmail") || "Email Clienti"} ({metrics.customerEmails})
              </TabsTrigger>
              <TabsTrigger value="admin_email" className="text-xs font-semibold rounded-lg">
                {t("notifications.tabAdminEmail") || "Email Segreteria"} ({metrics.adminEmails})
              </TabsTrigger>
              <TabsTrigger value="telegram" className="text-xs font-semibold rounded-lg">
                {t("notifications.tabTelegram") || "Telegram Bot"} ({metrics.telegrams})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Status Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={
                  t("notifications.searchPlaceholder") || "Cerca per nome o codice..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background/80"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl bg-background/80">
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
              className="h-9 w-9 shrink-0 rounded-xl"
              onClick={() => refresh()}
              title={t("common.refresh") || "Aggiorna"}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Templates Grid with Realtime Live Preview Frames ── */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 rounded-2xl">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-muted/60 rounded-full text-muted-foreground">
              <Bell className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                {t("notifications.noTemplatesFound") || "Nessun template trovato"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Nessun modello corrisponde ai criteri di ricerca o alla categoria selezionata.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const isEmail = template.channel === NotificationChannel.EMAIL;
            const isCustomer = template.recipient_type === RecipientType.CUSTOMER;

            return (
              <Card
                key={template.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/60 hover:border-primary/40 bg-card shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header with Status & Category Badges */}
                <CardHeader className="p-5 pb-3.5 space-y-3 bg-muted/20 border-b border-border/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={isEmail ? "default" : "secondary"}
                        className={`gap-1.5 text-xs py-1 px-2.5 rounded-lg font-semibold shadow-xs ${
                          isEmail
                            ? "bg-primary text-primary-foreground"
                            : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20"
                        }`}
                      >
                        {isEmail ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                        {isEmail ? "Email (Resend)" : "Telegram Bot"}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-xs py-1 px-2.5 rounded-lg font-medium border ${
                          isCustomer
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                        }`}
                      >
                        {isCustomer
                          ? t("notifications.recipientCustomer") || "Cliente"
                          : t("notifications.recipientAdmin") || "Amministrazione"}
                      </Badge>

                      <Badge variant="outline" className="font-mono text-[11px] py-0.5 px-2 bg-background/80">
                        {template.code}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-semibold ${
                          template.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        }`}
                      >
                        {template.is_active ? "Attivo" : "Disattivato"}
                      </span>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(val) => handleToggleStatus(template, val)}
                        aria-label="Attiva template"
                      />
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    {template.description && (
                      <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>

                {/* Card Content with Embedded Live Preview Frame */}
                <CardContent className="p-5 space-y-4 flex-1">
                  {/* Live Rendered Template Frame */}
                  <div className="relative group/frame">
                    <TemplatePreviewFrame template={template} isMini={true} />

                    {/* Quick Full Preview Overlay Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/frame:opacity-100 transition-opacity backdrop-blur-[2px] rounded-xl flex items-center justify-center gap-2 pointer-events-none group-hover/frame:pointer-events-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg font-semibold gap-1.5 text-xs rounded-xl"
                        onClick={() => handleOpenFullPreview(template)}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Anteprima a Schermo Intero</span>
                      </Button>
                    </div>
                  </div>

                  {/* Dynamic Variables Chips Preview */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Tag Dinamici Supportati ({template.available_variables?.length || 0}):</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-80">
                        {new Date(template.updated_at).toLocaleDateString("it-IT")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                      {(template.available_variables || []).slice(0, 5).map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-muted/60 text-muted-foreground border border-border/40"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                      {(template.available_variables || []).length > 5 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-primary/10 text-primary font-bold">
                          +{(template.available_variables || []).length - 5} altri
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer Actions */}
                <CardFooter className="p-4 pt-3 border-t border-border/40 bg-muted/10 gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-9 rounded-xl border-border/60 hover:bg-background"
                    onClick={() => handleOpenFullPreview(template)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Anteprima</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-9 rounded-xl border-border/60 hover:bg-background"
                    onClick={() => handleOpenTest(template)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("notifications.testSendBtn") || "Invia Test"}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-9 rounded-xl font-semibold shadow-xs"
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

      {/* Fullscreen Interactive Detail & Preview Modal */}
      <TemplateDetailModal
        template={previewingTemplate}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onOpenEdit={handleOpenEdit}
        onOpenTest={handleOpenTest}
      />

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
