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
import { NotificationChannel } from "../types";
import type { NotificationTemplateRecord } from "../types";
import { useTranslation } from "@/i18n/context";
import { Send, Mail, MessageSquare, Loader2 } from "lucide-react";

interface TestSendModalProps {
  template: NotificationTemplateRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSendTest: (params: { recipient: string }) => Promise<any>;
  isLoading?: boolean;
}

export function TestSendModal({
  template,
  isOpen,
  onClose,
  onSendTest,
  isLoading = false,
}: TestSendModalProps) {
  const { t } = useTranslation();
  const [recipient, setRecipient] = useState<string>("");

  React.useEffect(() => {
    if (template) {
      if (template.channel === NotificationChannel.EMAIL) {
        setRecipient("atenaschool20@gmail.com");
      } else {
        setRecipient("");
      }
    }
  }, [template]);

  if (!template) return null;

  const isEmail = template.channel === NotificationChannel.EMAIL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;
    await onSendTest({ recipient: recipient.trim() });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                {isEmail ? "Indirizzo Email" : "Telegram Chat ID / Canale"})
              </Label>
              <Input
                id="test-recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={
                  isEmail
                    ? t("notifications.recipientEmailPlaceholder") || "es. admin@atenaschool.com"
                    : t("notifications.recipientTelegramPlaceholder") || "es. @atena_school_bot"
                }
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {isEmail
                  ? "Verrà inviata un'email reale tramite il server Resend con prefisso [TEST]."
                  : "Verrà inviato un messaggio formattato in HTML tramite il Bot Telegram Atena."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel") || "Annulla"}
            </Button>
            <Button type="submit" disabled={isLoading || !recipient.trim()} className="gap-2">
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
    </Dialog>
  );
}
