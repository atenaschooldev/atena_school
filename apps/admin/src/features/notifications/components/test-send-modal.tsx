"use client";

import React, { useState, useMemo } from "react";
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
import { NotificationChannel } from "../types";
import type { NotificationTemplateRecord } from "../types";
import { useTranslation } from "@/i18n/context";
import { Send, Mail, MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface TestSendModalProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSendTest: (params: { recipient: string }) => Promise<any>;
  isLoading?: boolean;
}

interface TestSendModalFormProps {
  template: NotificationTemplateRecord;
  onClose: () => void;
  onSendTest: (params: { recipient: string }) => Promise<any>;
  isLoading?: boolean;
}

function TestSendModalForm({
  template,
  onClose,
  onSendTest,
  isLoading = false,
}: TestSendModalFormProps) {
  const { t } = useTranslation();
  const isEmail = template.channel === NotificationChannel.EMAIL;
  const [recipient, setRecipient] = useState<string>(
    isEmail ? "atenaschool20@gmail.com" : ""
  );

  const validationError = useMemo(() => {
    if (!recipient.trim()) return null;
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.trim())) {
        return t("notifications.invalidEmail") || "Inserisci un indirizzo email valido (es. admin@atenaschool.com)";
      }
    } else {
      if (recipient.trim().includes(" ")) {
        return t("notifications.invalidTelegram") || "Inserisci un Chat ID Telegram valido (es. 123456789 o -100123456789)";
      }
    }
    return null;
  }, [recipient, isEmail, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || validationError) return;
    await onSendTest({ recipient: recipient.trim() });
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[480px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEmail ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </div>
            <DialogTitle>{t("notifications.testModalTitle") || "Invia Notifica di Test"}</DialogTitle>
          </div>
          <DialogDescription>
            {t("notifications.testModalDesc") ||
              "Invia questo template con dati campione a un indirizzo reale per verificarne l'aspetto."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted/50 rounded-xl border space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Template
            </div>
            <div className="font-semibold text-sm">{template.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{template.code}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-recipient">
              {t("notifications.recipientLabel") || "Destinatario di Test"} (
              {isEmail ? (t("notifications.channelEmail") || "Email") : (t("notifications.channelTelegram") || "Telegram")})
            </Label>
            <Input
              id="test-recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={
                isEmail
                  ? t("notifications.recipientEmailPlaceholder") || "e.g. admin@atenaschool.com"
                  : t("notifications.recipientTelegramPlaceholder") || "e.g. Telegram chat ID"
              }
              required
              className={`font-mono text-sm ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {validationError ? (
              <div className="flex items-center gap-1.5 text-xs text-destructive font-medium mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{validationError}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isEmail
                  ? (t("notifications.testModalEmailDesc") || "Verrà inviata un'email reale tramite il server Resend con prefisso [TEST].")
                  : (t("notifications.testModalTgDesc") || "Verrà inviato un messaggio formattato in HTML tramite il Bot Telegram Atena.")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel") || "Annulla"}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !recipient.trim() || Boolean(validationError)}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isLoading
              ? t("notifications.sendingTest") || "Invio in corso..."
              : t("notifications.sendTestSubmit") || "Invia Ora"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function TestSendModal({
  template,
  isOpen,
  onClose,
  onSendTest,
  isLoading = false,
}: TestSendModalProps) {
  if (!isOpen || !template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <TestSendModalForm
        key={template.id}
        template={template}
        onClose={onClose}
        onSendTest={onSendTest}
        isLoading={isLoading}
      />
    </Dialog>
  );
}
