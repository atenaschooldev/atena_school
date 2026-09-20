"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";
import {
  NotificationChannel,
  RecipientType,
  SYSTEM_EVENTS_REGISTRY,
  NOTIFICATION_CHANNEL_DICTIONARY,
  RECIPIENT_TYPE_DICTIONARY,
} from "@atena/api-types";
import type {
  NotificationTriggerRecord,
  CreateNotificationTriggerDto,
  UpdateNotificationTriggerDto,
  NotificationTemplateRecord,
  SystemEventDefinition,
} from "@atena/api-types";
import {
  Zap,
  Mail,
  MessageSquare,
  Clock,
  Filter,
  Save,
  Loader2,
  CheckCircle2,
  CreditCard,
  Building2,
  FileText,
} from "lucide-react";

interface TriggerEditorDrawerProps {
  trigger: NotificationTriggerRecord | null;
  templates: NotificationTemplateRecord[];
  systemEvents: Record<string, SystemEventDefinition>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateNotificationTriggerDto | UpdateNotificationTriggerDto) => Promise<any>;
  isLoading?: boolean;
}

export function TriggerEditorDrawer({
  trigger,
  templates,
  systemEvents = SYSTEM_EVENTS_REGISTRY,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: TriggerEditorDrawerProps) {
  const { t, locale } = useTranslation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventKey, setEventKey] = useState("booking.created_stripe");
  const [channel, setChannel] = useState<number>(NotificationChannel.EMAIL);
  const [templateId, setTemplateId] = useState<string>("");
  const [recipientType, setRecipientType] = useState<number>(RecipientType.CUSTOMER);
  const [customRecipient, setCustomRecipient] = useState("");
  const [timingType, setTimingType] = useState<string>("immediate");
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [conditionsJson, setConditionsJson] = useState<string>("{}");
  const [isActive, setIsActive] = useState(true);

  // Filter templates matching selected channel
  const availableTemplates = templates.filter((t) => t.channel === channel);

  useEffect(() => {
    if (trigger) {
      setName(trigger.name || "");
      setDescription(trigger.description || "");
      setEventKey(trigger.event_key || "booking.created_stripe");
      setChannel(trigger.channel || NotificationChannel.EMAIL);
      setTemplateId(trigger.template_id || "");
      setRecipientType(trigger.recipient_type || RecipientType.CUSTOMER);
      setCustomRecipient(trigger.custom_recipient || "");
      setTimingType(trigger.timing_type || "immediate");
      setDelayMinutes(trigger.delay_seconds ? Math.round(trigger.delay_seconds / 60) : 0);
      setConditionsJson(JSON.stringify(trigger.conditions || {}, null, 2));
      setIsActive(trigger.is_active !== undefined ? trigger.is_active : true);
    } else {
      setName("");
      setDescription("");
      setEventKey("booking.created_stripe");
      setChannel(NotificationChannel.EMAIL);
      setTemplateId(availableTemplates[0]?.id || "");
      setRecipientType(RecipientType.CUSTOMER);
      setCustomRecipient("");
      setTimingType("immediate");
      setDelayMinutes(0);
      setConditionsJson("{}");
      setIsActive(true);
    }
  }, [trigger, isOpen]);

  // Set default template if current templateId is not matching channel
  useEffect(() => {
    if (!templateId && availableTemplates.length > 0) {
      setTemplateId(availableTemplates[0].id);
    }
  }, [channel, availableTemplates, templateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !templateId) return;

    let parsedConditions = {};
    try {
      if (conditionsJson.trim()) {
        parsedConditions = JSON.parse(conditionsJson);
      }
    } catch {
      // keep empty if invalid json
    }

    const payload: CreateNotificationTriggerDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      event_key: eventKey,
      template_id: templateId,
      channel,
      recipient_type: recipientType,
      custom_recipient: recipientType === 4 ? customRecipient.trim() : undefined,
      conditions: parsedConditions,
      timing_type: timingType,
      delay_seconds: timingType === "delayed" ? delayMinutes * 60 : 0,
      is_active: isActive,
    };

    await onSave(payload);
    onClose();
  };

  const currentEvent = systemEvents[eventKey] || {
    event_key: eventKey,
    label_it: eventKey,
    label_en: eventKey,
    description_it: "",
    description_en: "",
    available_variables: [],
  };

  const getEventLabel = (evt: SystemEventDefinition) => {
    if (locale === "en") return evt.label_en || evt.label_it;
    return evt.label_it;
  };

  const getEventDesc = (evt: SystemEventDefinition) => {
    if (locale === "en") return evt.description_en || evt.description_it;
    return evt.description_it;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-5 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {trigger
                    ? (t("notifications.editTriggerTitle") || "Modifica Regola di Automazione")
                    : (t("notifications.createTriggerTitle") || "Crea Nuova Regola di Automazione")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("notifications.triggerEditorSubtitle") ||
                    "Collega un evento del sistema a un template con condizioni e timing personalizzati."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* 1. Name & Active State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="trigger-name" className="text-xs font-semibold">
                  {t("notifications.triggerNameLabel") || "Nome Regola"} *
                </Label>
                <Input
                  id="trigger-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ricevuta Stripe al Cliente"
                  required
                  className="h-9 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5 p-2 bg-muted/40 rounded-xl border flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">{t("common.status") || "Stato"}</Label>
                  <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {isActive ? (t("common.active") || "Attivo") : (t("common.archived") || "Disattivo")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">{t("notifications.triggerStatusHint") || "Abilita regola"}</span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="scale-80 data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. System Event Trigger */}
            <div className="space-y-2 p-3.5 bg-muted/30 rounded-xl border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  {t("notifications.stepEvent") || "1. Quando si verifica questo evento:"}
                </Label>
              </div>

              <Select value={eventKey} onValueChange={setEventKey}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Seleziona evento..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(systemEvents).map((evt) => (
                    <SelectItem key={evt.event_key} value={evt.event_key} className="text-xs">
                      <div className="font-semibold">{getEventLabel(evt)}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{evt.event_key}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentEvent && (
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  {getEventDesc(currentEvent)}
                </p>
              )}
            </div>

            {/* 3. Channel & Template */}
            <div className="space-y-3 p-3.5 bg-muted/30 rounded-xl border">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                {t("notifications.stepTemplate") || "2. Invia questo Template:"}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Channel */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{t("notifications.columnChannel") || "Canale"}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel(NotificationChannel.EMAIL)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        channel === NotificationChannel.EMAIL
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" /> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel(NotificationChannel.TELEGRAM)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        channel === NotificationChannel.TELEGRAM
                          ? "bg-sky-500/10 border-sky-500/50 text-sky-600 dark:text-sky-400"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Telegram
                    </button>
                  </div>
                </div>

                {/* Template picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{t("notifications.tabTemplates") || "Modello Notifica"} *</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Seleziona modello..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs">
                          <div className="font-semibold">{tmpl.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{tmpl.code}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 4. Recipient & Timing */}
            <div className="space-y-3 p-3.5 bg-muted/30 rounded-xl border">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                {t("notifications.stepRecipientTiming") || "3. Destinatario & Tempistiche:"}
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recipient Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{t("notifications.columnRecipient") || "Destinatario"}</Label>
                  <Select
                    value={String(recipientType)}
                    onValueChange={(val) => setRecipientType(Number(val))}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(RecipientType.CUSTOMER)} className="text-xs">
                        👤 {locale === "en" ? "Customer (Purchaser / Parent)" : "Cliente (Genitore / Referente)"}
                      </SelectItem>
                      <SelectItem value={String(RecipientType.TEACHER)} className="text-xs">
                        🧑‍🏫 {locale === "en" ? "Teacher (Course Instructor)" : "Insegnante / Docente del Corso"}
                      </SelectItem>
                      <SelectItem value={String(RecipientType.ADMIN)} className="text-xs">
                        🏢 {locale === "en" ? "School Administration" : "Segreteria Atena School"}
                      </SelectItem>
                      <SelectItem value="4" className="text-xs">
                        ✍️ {locale === "en" ? "Custom Recipient..." : "Destinatario Personalizzato..."}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timing */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{t("notifications.timingLabel") || "Tempistica Invio"}</Label>
                  <Select value={timingType} onValueChange={setTimingType}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate" className="text-xs">
                        ⚡ {locale === "en" ? "Immediate (Instant)" : "Immediato (Subito)"}
                      </SelectItem>
                      <SelectItem value="delayed" className="text-xs">
                        ⏳ {locale === "en" ? "Delayed (after N minutes)" : "Ritardato (dopo N minuti)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom recipient input if value === 4 */}
                {recipientType === 4 && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium">Email o ID canale personalizzato</Label>
                    <Input
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      placeholder="e.g. director@atenaschool.com"
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>
                )}

                {/* Delay minutes input if delayed */}
                {timingType === "delayed" && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-medium">Minuti di attesa prima dell'invio</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10080}
                      value={delayMinutes || ""}
                      onChange={(e) => setDelayMinutes(Number(e.target.value))}
                      placeholder="e.g. 120 (2 ore)"
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Conditions (JSON Filter) */}
            <div className="space-y-2 p-3.5 bg-muted/30 rounded-xl border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-purple-500" />
                  {t("notifications.conditionsLabel") || "4. Condizioni e Filtri (Opzionale):"}
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">JSON format</span>
              </div>
              <Textarea
                value={conditionsJson}
                onChange={(e) => setConditionsJson(e.target.value)}
                rows={2}
                placeholder='{} o {"payment_method": "stripe", "min_amount": 50}'
                className="text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                {t("notifications.conditionsHint") ||
                  "Lascia {} per attivare sempre. Oppure inserisci filtri chiave-valore (ad es. min_amount, course_id, payment_method)."}
              </p>

              {currentEvent.available_variables?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {locale === "en" ? "Available Event Variables (click to insert into filter):" : "Variabili Evento Disponibili (clicca per inserire nel filtro):"}
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {currentEvent.available_variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => {
                          try {
                            const cur = JSON.parse(conditionsJson || "{}");
                            cur[v.key] = v.example || "valore";
                            setConditionsJson(JSON.stringify(cur, null, 2));
                          } catch {
                            setConditionsJson(`{\n  "${v.key}": "${v.example || "valore"}"\n}`);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-[11px] font-mono text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                        title={locale === "en" ? v.label_en : v.label_it}
                      >
                        <span className="font-semibold text-primary">{v.key}</span>
                        <span className="text-[9px] text-muted-foreground font-sans">({v.example})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t bg-muted/20 shrink-0 gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              {t("common.cancel") || "Annulla"}
            </Button>
            <Button type="submit" size="sm" disabled={isLoading || !name.trim() || !templateId} className="gap-2 font-semibold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {trigger
                ? (t("notifications.saveChanges") || "Salva Modifiche")
                : (t("notifications.createTriggerSubmit") || "Crea Regola")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
