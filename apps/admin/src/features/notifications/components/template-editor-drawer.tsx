"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationChannel } from "../types";
import type {
  NotificationTemplateRecord,
  UpdateNotificationTemplateDto,
} from "../types";
import { TemplatePreviewFrame } from "./template-preview-card";
import { useTranslation } from "@/i18n/context";
import {
  Mail,
  MessageSquare,
  Save,
  Send,
  Sparkles,
  Copy,
  Eye,
  Code2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateEditorDrawerProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, payload: UpdateNotificationTemplateDto) => Promise<any>;
  onOpenTestModal: (template: NotificationTemplateRecord) => void;
  isLoading?: boolean;
}

const SAMPLE_VARIABLES_PREVIEW: Record<string, string> = {
  student_name: "Mario Rossi",
  course_name: "Corso di Inglese Individuale B2",
  amount_paid: "€180.00",
  registration_fee: "€30.00",
  total_amount: "€210.00",
  lesson_schedule: "Lunedì e Mercoledì 18:00 - 19:30",
  start_date: "01/10/2026",
  app_url: "https://app.atenaschool.com",
  booking_id: "BK-2026-098",
  sender_name: "Giulia Bianchi",
  sender_email: "giulia.bianchi@example.com",
  sender_phone: "+39 333 1234567",
  topic: "Informazioni Corsi & Certificazioni",
  message: "Buongiorno, vorrei informazioni sulle lezioni di gruppo per il prossimo anno.",
  payment_method: "Carta di Credito (Stripe)",
  payment_status: "Pagato Online",
  purchaser_name: "Mario Rossi",
  purchaser_email: "mario.rossi@example.com",
  purchaser_phone: "+39 333 9876543",
};

export function TemplateEditorDrawer({
  template,
  isOpen,
  onClose,
  onSave,
  onOpenTestModal,
  isLoading = false,
}: TemplateEditorDrawerProps) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState("editor");

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const [lastFocusedField, setLastFocusedField] = useState<"subject" | "body">("body");

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setDescription(template.description || "");
      setSubjectTemplate(template.subject_template || "");
      setBodyTemplate(template.body_template || "");
      setIsActive(template.is_active ?? true);
      setActiveTab("editor");
    }
  }, [template]);

  if (!template) return null;

  const isEmail = template.channel === NotificationChannel.EMAIL;

  const insertVariable = (variableName: string) => {
    const tag = `{{${variableName}}}`;
    if (lastFocusedField === "subject" && isEmail && subjectRef.current) {
      const input = subjectRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const updated =
        subjectTemplate.substring(0, start) + tag + subjectTemplate.substring(end);
      setSubjectTemplate(updated);
      toast.success(`Inserito ${tag}`);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const updated =
          bodyTemplate.substring(0, start) + tag + bodyTemplate.substring(end);
        setBodyTemplate(updated);
        toast.success(`Inserito ${tag}`);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
      } else {
        setBodyTemplate((prev) => prev + tag);
        toast.success(`Inserito ${tag}`);
      }
    }
    // Also copy to clipboard
    navigator.clipboard.writeText(tag).catch(() => null);
  };

  const renderCompiledSubject = () => {
    return subjectTemplate.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return SAMPLE_VARIABLES_PREVIEW[key] || `[${key}]`;
    });
  };

  const renderCompiledBody = () => {
    return bodyTemplate.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return SAMPLE_VARIABLES_PREVIEW[key] || `[${key}]`;
    });
  };

  const handleSave = async () => {
    await onSave(template.id, {
      name,
      description,
      subject_template: isEmail ? subjectTemplate : undefined,
      body_template: bodyTemplate,
      is_active: isActive,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <div className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={isEmail ? "default" : "secondary"}
                className="gap-1.5 py-1 px-2.5"
              >
                {isEmail ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                {isEmail
                  ? t("notifications.channelEmail") || "Email (Resend)"
                  : t("notifications.channelTelegram") || "Telegram"}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {template.code}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {isActive
                    ? t("notifications.activeBadge") || "Attivo"
                    : t("notifications.inactiveBadge") || "Disattivato"}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="Attiva/Disattiva template"
                />
              </div>
            </div>
          </div>

          <SheetTitle className="text-xl font-bold">{name}</SheetTitle>
          <SheetDescription className="text-xs mt-1">{description}</SheetDescription>
        </div>

        {/* Content Body */}
        <ScrollArea className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-64 grid-cols-2">
                <TabsTrigger value="editor" className="gap-1.5">
                  <Code2 className="h-4 w-4" />
                  {t("notifications.editorTab") || "Editor"}
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="h-4 w-4" />
                  {t("notifications.previewTab") || "Anteprima"}
                </TabsTrigger>
              </TabsList>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => onOpenTestModal(template)}
              >
                <Send className="h-3.5 w-3.5" />
                {t("notifications.testSendBtn") || "Invia Test"}
              </Button>
            </div>

            {/* Tab: Editor */}
            <TabsContent value="editor" className="space-y-6 mt-0">
              {/* Dynamic Variables Palette */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    {t("notifications.variablesTitle") || "Variabili Dinamiche Disponibili"}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {t("notifications.variablesHint") || "Clicca per inserire"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(template.available_variables || []).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-150 border cursor-pointer"
                      title={`Inserisci {{${v}}}`}
                    >
                      <span className="opacity-70 group-hover:opacity-100">{`{{${v}}}`}</span>
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">
                    {t("notifications.templateName") || "Nome Template"}
                  </Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome descrittivo..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-desc">
                    {t("notifications.templateDescription") || "Descrizione Scopo"}
                  </Label>
                  <Input
                    id="template-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Scopo di questo template..."
                  />
                </div>
              </div>

              {/* Subject (for Email) */}
              {isEmail && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="template-subject">
                      {t("notifications.subjectLabel") || "Oggetto Email"}
                    </Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {"Supporta tag {{variabile}}"}
                    </span>
                  </div>
                  <Input
                    id="template-subject"
                    ref={subjectRef}
                    value={subjectTemplate}
                    onFocus={() => setLastFocusedField("subject")}
                    onChange={(e) => setSubjectTemplate(e.target.value)}
                    placeholder="Oggetto dell'email..."
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-body">
                    {t("notifications.bodyLabel") || "Corpo del Messaggio (HTML / Testo)"}
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {isEmail ? "HTML / Text" : "HTML Tag Telegram (<b>, <i>, <a>)"}
                  </span>
                </div>
                <Textarea
                  id="template-body"
                  ref={bodyRef}
                  value={bodyTemplate}
                  onFocus={() => setLastFocusedField("body")}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  rows={14}
                  className="font-mono text-xs leading-relaxed resize-y bg-muted/20"
                  placeholder="Inserisci il codice del messaggio o email..."
                />
              </div>
            </TabsContent>

            {/* Tab: Live Preview */}
            <TabsContent value="preview" className="space-y-4 mt-0">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {t("notifications.sampleDataBadge") ||
                      "Anteprima reale renderizzata con dati studente e corso attuali"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border bg-background overflow-hidden shadow-xs h-[520px]">
                <TemplatePreviewFrame
                  template={{
                    ...template,
                    name,
                    description,
                    subject_template: subjectTemplate,
                    body_template: bodyTemplate,
                    is_active: isActive,
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="p-6 border-t bg-muted/30 flex-row justify-between items-center gap-3 sm:space-x-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel") || "Annulla"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("common.save") || "Salva Modifiche"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
