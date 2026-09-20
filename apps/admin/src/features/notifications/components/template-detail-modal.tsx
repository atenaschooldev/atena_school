"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationChannel } from "../types";
import type { NotificationTemplateRecord } from "../types";
import {
  TemplatePreviewFrame,
  SAMPLE_PREVIEW_DATA,
  buildCompleteEmailHtml,
} from "./template-preview-card";
import { useTranslation } from "@/i18n/context";
import {
  Mail,
  MessageSquare,
  Send,
  Edit3,
  Sliders,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateDetailModalProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (template: NotificationTemplateRecord) => void;
  onOpenTest: (template: NotificationTemplateRecord) => void;
}

export function TemplateDetailModal({
  template,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenTest,
}: TemplateDetailModalProps) {
  const { t } = useTranslation();
  const [customVars, setCustomVars] = useState<Record<string, string>>(SAMPLE_PREVIEW_DATA);
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const isEmail = template.channel === NotificationChannel.EMAIL;

  const handleVarChange = (key: string, value: string) => {
    setCustomVars((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "total_amount") next.amount_paid = value;
      if (key === "amount_paid") next.total_amount = value;
      if (key === "date") next.start_date = value;
      if (key === "start_date") next.date = value;
      if (key === "lesson_schedule") next.schedule_text = value;
      if (key === "schedule_text") next.lesson_schedule = value;
      return next;
    });
  };

  const handleResetVars = () => {
    setCustomVars(SAMPLE_PREVIEW_DATA);
    toast.success("Dati simulazione ripristinati");
  };

  const handleCopyBody = () => {
    let contentToCopy = template.body_template || "";
    if (isEmail) {
      contentToCopy = buildCompleteEmailHtml(template, customVars).html;
    }
    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopied(true);
      toast.success("Codice HTML del template copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-[95vw] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-5 px-6 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-xs">
                {isEmail ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  {template.name}
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? "Attivo" : "Disattivato"}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {template.code}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {template.description || "Nessuna descrizione impostata"}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs rounded-xl"
                onClick={() => {
                  onClose();
                  onOpenTest(template);
                }}
              >
                <Send className="h-3.5 w-3.5" />
                {t("notifications.testSendBtn") || "Invia Test"}
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-1.5 h-8 text-xs font-semibold rounded-xl shadow-xs"
                onClick={() => {
                  onClose();
                  onOpenEdit(template);
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                {t("notifications.editTemplate") || "Modifica"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Real Live Render Preview */}
          <div className="lg:col-span-8 p-5 overflow-hidden bg-muted/10 flex flex-col space-y-3">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Anteprima Reale Mail / Messaggio (100% Fedele al Client di Posta)</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={handleCopyBody}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copia HTML</span>
              </Button>
            </div>

            <div className="flex-1 w-full h-full min-h-0 rounded-2xl overflow-hidden">
              <TemplatePreviewFrame template={template} customVariables={customVars} />
            </div>
          </div>

          {/* Right Column: Interactive Sample Variables Simulator */}
          <div className="lg:col-span-4 p-5 border-l bg-card flex flex-col overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-2 border-b shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <Sliders className="h-4 w-4 text-primary" />
                <span>Variabili & Dati Campione</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                onClick={handleResetVars}
                title="Ripristina valori predefiniti"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed shrink-0">
              Modifica i valori sottostanti per verificare istantaneamente la reattività e la formattazione del template:
            </p>

            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3 pb-4">
                {[
                  { key: "purchaser_name", label: "Nome Acquirente / Referente" },
                  { key: "student_name", label: "Nome Studente (Allievo)" },
                  { key: "course_name", label: "Nome Corso" },
                  { key: "total_amount", label: "Totale (€)" },
                  { key: "registration_fee", label: "Quota Iscrizione (€)" },
                  { key: "lesson_schedule", label: "Orario e Frequenza" },
                  { key: "date", label: "Data Inizio Corso" },
                  { key: "student_birth_date", label: "Data Nascita Studente" },
                  { key: "birth_place", label: "Luogo di Nascita" },
                  { key: "booking_id", label: "ID Prenotazione Univoco" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`var-${key}`} className="text-[11px] font-semibold text-foreground">
                        {label}
                      </Label>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {`{{${key}}}`}
                      </span>
                    </div>
                    <Input
                      id={`var-${key}`}
                      value={customVars[key] || ""}
                      onChange={(e) => handleVarChange(key, e.target.value)}
                      placeholder={`Valore per ${key}...`}
                      className="h-8 text-xs font-sans rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
