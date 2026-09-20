"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationChannel,
  NotificationType,
  RecipientType,
  NOTIFICATION_TYPE_DICTIONARY,
} from "@atena/api-types";
import type { CreateNotificationTemplateDto } from "../types";
import { useTranslation } from "@/i18n/context";
import { Plus, Mail, MessageSquare, Loader2, Sparkles } from "lucide-react";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: CreateNotificationTemplateDto) => Promise<any>;
  isLoading?: boolean;
}

export function CreateTemplateDialog({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateTemplateDialogProps) {
  const { t, locale } = useTranslation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [channel, setChannel] = useState<NotificationChannel>(NotificationChannel.EMAIL);
  const [notificationType, setNotificationType] = useState<NotificationType>(NotificationType.BOOKING_CONFIRMATION);
  const [recipientType, setRecipientType] = useState<RecipientType>(RecipientType.CUSTOMER);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isCustomCode, setIsCustomCode] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomCode) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setCode(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    await onCreate({
      name: name.trim(),
      code: code.trim().toLowerCase(),
      description: description.trim() || undefined,
      channel,
      notification_type: notificationType,
      recipient_type: recipientType,
      subject: channel === NotificationChannel.EMAIL ? (subject.trim() || `Notifica: ${name.trim()}`) : undefined,
    });

    // Reset
    setName("");
    setCode("");
    setSubject("");
    setDescription("");
    setIsCustomCode(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <DialogTitle>{t("notifications.createTemplateTitle") || "Crea Nuovo Modello Notifica"}</DialogTitle>
            </div>
            <DialogDescription>
              {t("notifications.createTemplateDesc") ||
                "Crea un nuovo modello grafico per Email (Resend) o messaggi Telegram, modificabile poi con il visual builder."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Name & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="template-name">
                  {t("notifications.templateName") || "Nome Modello"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Promemoria Saldo Inizio Corso"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-code">
                  {t("notifications.templateCode") || "Codice Univoco (Slug)"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setIsCustomCode(true);
                  }}
                  placeholder="e.g. payment_reminder_start"
                  required
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Channel and Recipient Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("notifications.columnChannel") || "Canale di Invio"}</Label>
                <Select
                  value={String(channel)}
                  onValueChange={(val) => setChannel(Number(val) as NotificationChannel)}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(NotificationChannel.EMAIL)}>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Email (Resend)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={String(NotificationChannel.TELEGRAM)}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-sky-500" />
                        <span>Telegram Bot</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t("notifications.columnRecipient") || "Destinatario Target"}</Label>
                <Select
                  value={String(recipientType)}
                  onValueChange={(val) => setRecipientType(Number(val) as RecipientType)}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(RecipientType.CUSTOMER)}>
                      {t("notifications.recipientCustomer") || "Cliente / Allievo"}
                    </SelectItem>
                    <SelectItem value={String(RecipientType.ADMIN)}>
                      {t("notifications.recipientAdmin") || "Segreteria / Admin"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notification Type Category */}
            <div className="space-y-1.5">
              <Label>{t("notifications.columnEventType") || "Categoria Notifica"}</Label>
              <Select
                value={String(notificationType)}
                onValueChange={(val) => setNotificationType(Number(val) as NotificationType)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTIFICATION_TYPE_DICTIONARY).map(([id, entry]) => (
                    <SelectItem key={id} value={id}>
                      {locale === "en" ? entry.label_en || entry.label_it : entry.label_it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject (only for Email) */}
            {channel === NotificationChannel.EMAIL && (
              <div className="space-y-1.5">
                <Label htmlFor="template-subject">
                  {t("notifications.emailSubject") || "Oggetto Email Predefinito"}
                </Label>
                <Input
                  id="template-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Conferma Iscrizione: {{course_name}} • Atena School"
                />
                <span className="text-[11px] text-muted-foreground">
                  Supporta variabili dinamiche come <code>{"{{course_name}}"}</code>, <code>{"{{student_name}}"}</code>.
                </span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="template-desc">{t("common.description") || "Descrizione (Opzionale)"}</Label>
              <Textarea
                id="template-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Spiega quando e a chi viene inviato questo modello..."
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel") || "Annulla"}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !code.trim()} className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isLoading
                ? t("common.creating") || "Creazione..."
                : t("notifications.createTemplateSubmit") || "Crea Modello"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
