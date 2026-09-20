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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationChannel, NotificationTemplateRecord } from "../types";
import { TemplatePreviewFrame, SAMPLE_PREVIEW_DATA } from "./template-preview-card";
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
    setCustomVars((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetVars = () => {
    setCustomVars(SAMPLE_PREVIEW_DATA);
    toast.success("Dati campione ripristinati");
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(template.body_template || "").then(() => {
      setCopied(true);
      toast.success("Codice template copiato negli appunti!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-xs">
                {isEmail ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {template.name}
                  <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                    {template.is_active ? "Attivo" : "Disattivato"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-muted-foreground mt-0.5">
                  {template.code} • {template.description || "Nessuna descrizione"}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
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
                className="gap-1.5 h-8 text-xs font-semibold"
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
          {/* Left Column: Live Render Preview */}
          <div className="lg:col-span-8 p-6 overflow-y-auto bg-muted/10 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Anteprima dal Vivo (Rendering Reale)</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={handleCopyBody}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copia Codice</span>
              </Button>
            </div>

            <div className="flex-1 min-h-[420px]">
              <TemplatePreviewFrame template={template} customVariables={customVars} />
            </div>
          </div>

          {/* Right Column: Interactive Sample Variables Tester */}
          <div className="lg:col-span-4 p-6 border-l bg-card flex flex-col overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <Sliders className="h-4 w-4 text-primary" />
                <span>Dati di Simulazione</span>
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

            <p className="text-xs text-muted-foreground leading-relaxed">
              Modifica i valori qui sotto per testare la formattazione e la reattività del template in tempo reale:
            </p>

            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3.5">
                {(template.available_variables || Object.keys(SAMPLE_PREVIEW_DATA)).map((varKey) => (
                  <div key={varKey} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`var-${varKey}`} className="text-xs font-mono text-muted-foreground">
                        {`{{${varKey}}}`}
                      </Label>
                    </div>
                    <Input
                      id={`var-${varKey}`}
                      value={customVars[varKey] || ""}
                      onChange={(e) => handleVarChange(varKey, e.target.value)}
                      placeholder={`Valore per {{${varKey}}}...`}
                      className="h-8 text-xs font-sans"
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
