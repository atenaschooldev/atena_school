"use client";

import React, { useState, Suspense, lazy } from "react";
import { useNotificationTriggers } from "../hooks/use-notification-triggers";
import { useNotificationTemplates } from "../hooks/use-notification-templates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CellCopyableId } from "@/components/shared/cell-copyable-id";
import { useTranslation } from "@/i18n/context";

const TriggerEditorDrawer = lazy(() =>
  import("./trigger-editor-drawer").then((m) => ({
    default: m.TriggerEditorDrawer,
  }))
);
import {
  NotificationChannel,
  RecipientType,
  TriggerTimingType,
  NOTIFICATION_CHANNEL_DICTIONARY,
} from "@atena/api-types";
import type { NotificationTriggerRecord } from "@atena/api-types";
import {
  Zap,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  ArrowRight,
  Clock,
  Filter,
} from "lucide-react";

export function NotificationTriggersView() {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<NotificationTriggerRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  const filteredTriggers = triggers.filter((trg) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const matchName = trg.name.toLowerCase().includes(q);
    const matchEvent = trg.event_key.toLowerCase().includes(q);
    const matchTemplate = trg.template?.name?.toLowerCase().includes(q) || false;
    return matchName || matchEvent || matchTemplate;
  });

  const getChannelLabel = (channel: number): string => {
    const entry = NOTIFICATION_CHANNEL_DICTIONARY[channel as keyof typeof NOTIFICATION_CHANNEL_DICTIONARY];
    if (entry) {
      if (locale === "en") return entry.label_en || entry.label_it;
      return entry.label_it;
    }
    return channel === NotificationChannel.EMAIL ? "Email" : "Telegram";
  };

  const getRecipientLabel = (type: number): string => {
    if (type === RecipientType.CUSTOMER) return locale === "en" ? "Customer (Purchaser / Parent)" : "Cliente (Genitore / Referente)";
    if (type === RecipientType.ADMIN) return locale === "en" ? "School Administration" : "Segreteria Atena School";
    if (type === RecipientType.TEACHER) return locale === "en" ? "Teacher" : "Docente / Insegnante";
    return locale === "en" ? "Custom Recipient" : "Personalizzato";
  };

  const getEventName = (key: string): string => {
    const evt = systemEvents[key];
    if (evt) {
      if (locale === "en") return evt.label_en || evt.label_it;
      return evt.label_it;
    }
    return key;
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
                placeholder={t("notifications.searchTriggersPlaceholder") || "Cerca per nome regola, evento o template..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
              className="h-9 px-2.5 cursor-pointer text-xs"
              title={t("common.refresh") || "Ricarica"}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
        </CardContent>
      </Card>

      {/* Triggers Cards Grid */}
      {loading && triggers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border rounded-2xl bg-card">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          <span className="text-xs">{t("common.loading") || "Caricamento regole..."}</span>
        </div>
      ) : filteredTriggers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground border rounded-2xl bg-card">
          <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-semibold">{t("notifications.noTriggersFound") || "Nessuna regola di automazione trovata"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("notifications.noTriggersHint") || "Crea una nuova regola per automatizzare l'invio di notifiche ad eventi specifici."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTriggers.map((trg) => {
            const isEmail = trg.channel === NotificationChannel.EMAIL;
            const hasConditions = trg.conditions && Object.keys(trg.conditions).length > 0;

            return (
              <Card
                key={trg.id}
                className="flex flex-col h-full rounded-2xl border border-border/60 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 group"
              >
                {/* Header */}
                <CardHeader className="p-4 pb-3 space-y-2.5 border-b bg-muted/10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs text-foreground truncate">{getEventName(trg.event_key)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <CellCopyableId id={trg.id} />
                      <Switch
                        checked={trg.is_active}
                        onCheckedChange={(val) => toggleTrigger(trg.id, val)}
                        className="scale-75 cursor-pointer data-[state=checked]:bg-emerald-600"
                        title={trg.is_active ? "Attivo" : "Disattivo"}
                      />
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {trg.name}
                    </CardTitle>
                    {trg.description && (
                      <CardDescription className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {trg.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>

                {/* Workflow Flow Canvas */}
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Step Diagram */}
                  <div className="space-y-2.5 bg-muted/20 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-semibold flex items-center gap-1">
                        {isEmail ? <Mail className="h-3 w-3 text-emerald-500" /> : <MessageSquare className="h-3 w-3 text-sky-500" />}
                        {getChannelLabel(trg.channel)}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {trg.timing_type === TriggerTimingType.DELAYED || (trg.timing_type as any) === "delayed"
                          ? `⏳ +${Math.round(trg.delay_seconds / 60)}m`
                          : "⚡ Immediato"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <div className="p-1.5 rounded-md bg-background border flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground block truncate">{t("notifications.stepTemplate") || "Modello:"}</span>
                        <strong className="text-xs font-semibold text-foreground truncate block">
                          {trg.template?.name || "Template ID: " + (trg.notification_template_id || trg.template_id)}
                        </strong>
                      </div>

                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mx-0.5" />

                      <div className="p-1.5 rounded-md bg-background border flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground block truncate">{t("notifications.columnRecipient") || "Destinatario:"}</span>
                        <strong className="text-xs font-semibold text-foreground truncate block">
                          {trg.recipient_type === 4 ? trg.custom_recipient : getRecipientLabel(trg.recipient_type)}
                        </strong>
                      </div>
                    </div>

                    {hasConditions && (
                      <div className="pt-1 border-t border-border/40 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono truncate">
                        <Filter className="h-3 w-3 text-purple-500 shrink-0" />
                        <span className="truncate">{JSON.stringify(trg.conditions)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrigger(trg.id)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {t("common.delete") || "Elimina"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(trg)}
                      className="h-7 px-2.5 text-xs font-medium cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {t("common.edit") || "Modifica"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <Suspense fallback={null}>
          <TriggerEditorDrawer
            trigger={selectedTrigger}
            templates={templates}
            systemEvents={systemEvents}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
            isLoading={isCreating || isUpdating}
          />
        </Suspense>
      )}
    </div>
  );
}
