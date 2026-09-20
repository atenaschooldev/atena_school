"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Radio,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { MaskedIntegrationSecretRecord, TestIntegrationResult } from "@atena/api-types";

interface StatusFeedback {
  type: "success" | "error";
  message: string;
  details?: string;
  timestamp: string;
}

function FeedbackBanner({
  status,
  onClear,
}: {
  status: StatusFeedback | null;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!status) return null;

  const isSuccess = status.type === "success";
  const fullText = status.details
    ? `${status.message}\n\nDettagli:\n${status.details}`
    : status.message;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`rounded-xl p-4 text-sm border transition-all mt-3 ${
        isSuccess
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
          : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive dark:text-red-400 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm">
              {isSuccess ? "✅ Operazione Riuscita" : "❌ Operazione Fallita"}
            </p>
            <p className="mt-1 text-xs opacity-90 leading-relaxed break-words">{status.message}</p>
            {status.details && (
              <pre className="mt-2.5 p-2.5 rounded-lg bg-black/10 dark:bg-black/40 text-[11px] font-mono whitespace-pre-wrap max-h-40 overflow-auto border border-border/50">
                {status.details}
              </pre>
            )}
            <span className="text-[10px] opacity-60 block mt-1.5">
              Ora: {status.timestamp}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs bg-background/50 hover:bg-background cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            {copied ? "Copiato!" : "Copia"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 w-7 p-0 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WhiteLabelIntegrations() {
  const [loading, setLoading] = useState<boolean>(true);
  const [integrations, setIntegrations] = useState<Record<string, MaskedIntegrationSecretRecord>>({});

  // Status feedback states per card
  const [resendStatus, setResendStatus] = useState<StatusFeedback | null>(null);
  const [tgStatus, setTgStatus] = useState<StatusFeedback | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StatusFeedback | null>(null);

  // Form states
  const [resendKey, setResendKey] = useState("");
  const [resendFrom, setResendFrom] = useState("");
  const [resendAdminEmail, setResendAdminEmail] = useState("");
  const [savingResend, setSavingResend] = useState(false);
  const [testingResend, setTestingResend] = useState(false);

  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgLocale, setTgLocale] = useState<"it" | "en" | "ru">("it");
  const [savingTg, setSavingTg] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);

  const [stripeSecret, setStripeSecret] = useState("");
  const [stripePublishable, setStripePublishable] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [savingStripe, setSavingStripe] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);

  const loadData = async (initial: boolean = false) => {
    try {
      if (initial) {
        setLoading(true);
      }
      const data = await api.get<Record<string, MaskedIntegrationSecretRecord>>("/admin/integrations");
      if (data) {
        setIntegrations(data);
        if (initial) {
          if (data.resend?.credentials) {
            setResendKey(String(data.resend.credentials.apiKey || ""));
            setResendFrom(String(data.resend.credentials.fromEmail || ""));
            setResendAdminEmail(String(data.resend.credentials.adminEmail || ""));
          }
          if (data.telegram?.credentials) {
            setTgToken(String(data.telegram.credentials.botToken || ""));
            setTgChatId(String(data.telegram.credentials.chatId || ""));
            setTgLocale((data.telegram.credentials.locale as any) || "it");
          }
          if (data.stripe?.credentials) {
            setStripeSecret(String(data.stripe.credentials.secretKey || ""));
            setStripePublishable(String(data.stripe.credentials.publishableKey || ""));
            setStripeWebhook(String(data.stripe.credentials.webhookSecret || ""));
          }
        }
      }
    } catch (err: any) {
      console.warn("Failed to load integrations:", err);
      toast.error(err.message || "Errore durante il caricamento delle integrazioni");
    } finally {
      if (initial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Handlers for Resend
  const handleSaveResend = async () => {
    setSavingResend(true);
    try {
      await api.patch("/admin/integrations/resend", {
        credentials: {
          apiKey: resendKey,
          fromEmail: resendFrom,
          adminEmail: resendAdminEmail,
        },
      });
      const now = new Date().toLocaleTimeString("it-IT");
      setResendStatus({
        type: "success",
        message: "Credenziali Resend salvate con successo nel Database!",
        timestamp: now,
      });
      toast.success("Credenziali Resend salvate nel Database!");
      await loadData(false);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setResendStatus({
        type: "error",
        message: "Impossibile salvare le credenziali Resend",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSavingResend(false);
    }
  };

  const handleTestResend = async () => {
    setTestingResend(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/resend", {
        toEmail: resendAdminEmail || undefined,
      });
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setResendStatus({
          type: "success",
          message: res.message,
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setResendStatus({
          type: "error",
          message: res.message || "Invio email di test fallito",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setResendStatus({
        type: "error",
        message: "Errore durante il test di invio Resend",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setTestingResend(false);
    }
  };

  // Handlers for Telegram
  const handleSaveTelegram = async () => {
    setSavingTg(true);
    try {
      await api.patch("/admin/integrations/telegram", {
        credentials: {
          botToken: tgToken,
          chatId: tgChatId,
          locale: tgLocale,
        },
      });
      const now = new Date().toLocaleTimeString("it-IT");
      setTgStatus({
        type: "success",
        message: "Credenziali Telegram salvate con successo nel Database!",
        timestamp: now,
      });
      toast.success("Credenziali Telegram salvate nel Database!");
      await loadData(false);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setTgStatus({
        type: "error",
        message: "Impossibile salvare le credenziali Telegram",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSavingTg(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTg(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/telegram", {});
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setTgStatus({
          type: "success",
          message: res.message,
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setTgStatus({
          type: "error",
          message: res.message || "Invio messaggio Telegram fallito",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setTgStatus({
        type: "error",
        message: "Errore durante il test Telegram",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setTestingTg(false);
    }
  };

  const handleSetTelegramWebhook = async () => {
    setSettingWebhook(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/telegram/set-webhook", {});
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setTgStatus({
          type: "success",
          message: res.message,
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setTgStatus({
          type: "error",
          message: res.message || "Registrazione webhook fallita",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setTgStatus({
        type: "error",
        message: "Errore durante la registrazione del webhook Telegram",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSettingWebhook(false);
    }
  };

  // Handlers for Stripe
  const handleSaveStripe = async () => {
    setSavingStripe(true);
    try {
      await api.patch("/admin/integrations/stripe", {
        credentials: {
          secretKey: stripeSecret,
          publishableKey: stripePublishable,
          webhookSecret: stripeWebhook,
        },
      });
      const now = new Date().toLocaleTimeString("it-IT");
      setStripeStatus({
        type: "success",
        message: "Credenziali Stripe salvate con successo nel Database!",
        timestamp: now,
      });
      toast.success("Credenziali Stripe salvate nel Database!");
      await loadData(false);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setStripeStatus({
        type: "error",
        message: "Impossibile salvare le credenziali Stripe",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSavingStripe(false);
    }
  };

  const handleTestStripe = async () => {
    setTestingStripe(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/stripe", {});
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setStripeStatus({
          type: "success",
          message: res.message,
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setStripeStatus({
          type: "error",
          message: res.message || "Verifica Stripe fallita",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setStripeStatus({
        type: "error",
        message: "Errore durante la verifica delle credenziali Stripe",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setTestingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Caricamento impostazioni white-label...
      </div>
    );
  }

  const resendInfo = integrations.resend;
  const tgInfo = integrations.telegram;
  const stripeInfo = integrations.stripe;

  return (
    <div className="space-y-6">
      {/* Resend Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Resend (Email Transazionali)</CardTitle>
                <CardDescription>
                  Notifiche di prenotazione per clienti e comunicazioni della segreteria
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={resendInfo?.source === "database" ? "default" : "secondary"}>
                {resendInfo?.source === "database" ? "Database (White-label)" : "ENV Fallback"}
              </Badge>
              <Badge variant={resendInfo?.is_configured ? "outline" : "destructive"}>
                {resendInfo?.is_configured ? "Configurato" : "Mancante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="resendApiKey">Resend API Key</Label>
              <Input
                id="resendApiKey"
                type="text"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_••••••••••••"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Lascia il valore mascherato per mantenere la chiave attuale, oppure inseriscine una nuova per sovrascriverla.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resendFrom">Mittente Predefinito (From)</Label>
              <Input
                id="resendFrom"
                value={resendFrom}
                onChange={(e) => setResendFrom(e.target.value)}
                placeholder="Atena School <info@atenaschool.com>"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resendAdminEmail">Email Segreteria / Notifiche Admin</Label>
              <Input
                id="resendAdminEmail"
                type="email"
                value={resendAdminEmail}
                onChange={(e) => setResendAdminEmail(e.target.value)}
                placeholder="atenaschool20@gmail.com"
              />
            </div>
          </div>

          <FeedbackBanner
            status={resendStatus}
            onClear={() => setResendStatus(null)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestResend}
              disabled={testingResend}
              className="text-xs cursor-pointer"
            >
              {testingResend ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Invia Email di Test
            </Button>
            <Button type="button" size="sm" onClick={handleSaveResend} disabled={savingResend} className="cursor-pointer">
              {savingResend && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Credenziali Resend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Telegram Bot & CRM Interattivo</CardTitle>
                <CardDescription>
                  Notifiche istantanee alla segreteria e pulsanti rapidi per approvazione/saldo
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={tgInfo?.source === "database" ? "default" : "secondary"}>
                {tgInfo?.source === "database" ? "Database (White-label)" : "ENV Fallback"}
              </Badge>
              <Badge variant={tgInfo?.is_configured ? "outline" : "destructive"}>
                {tgInfo?.is_configured ? "Configurato" : "Mancante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tgToken">Bot Token</Label>
              <Input
                id="tgToken"
                type="text"
                value={tgToken}
                onChange={(e) => setTgToken(e.target.value)}
                placeholder="123456789:AA••••••••"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgChatId">Chat ID / Canale Notifiche</Label>
              <Input
                id="tgChatId"
                type="text"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                placeholder="-100123456789"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <FeedbackBanner
            status={tgStatus}
            onClear={() => setTgStatus(null)}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestTelegram}
                disabled={testingTg}
                className="text-xs cursor-pointer"
              >
                {testingTg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Invia Test Telegram
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSetTelegramWebhook}
                disabled={settingWebhook}
                className="text-xs cursor-pointer"
              >
                {settingWebhook ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                )}
                Registra Webhook Bot
              </Button>
            </div>
            <Button type="button" size="sm" onClick={handleSaveTelegram} disabled={savingTg} className="cursor-pointer">
              {savingTg && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Credenziali Telegram
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Credentials Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Stripe Gateway & Chiavi API</CardTitle>
                <CardDescription>
                  Chiavi di connessione per l'incasso di quote e abbonamenti con carta di credito
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={stripeInfo?.source === "database" ? "default" : "secondary"}>
                {stripeInfo?.source === "database" ? "Database (White-label)" : "ENV Fallback"}
              </Badge>
              <Badge variant={stripeInfo?.is_configured ? "outline" : "destructive"}>
                {stripeInfo?.is_configured ? "Configurato" : "Mancante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="stripeSecret">Secret Key (sk_...)</Label>
              <Input
                id="stripeSecret"
                type="text"
                value={stripeSecret}
                onChange={(e) => setStripeSecret(e.target.value)}
                placeholder="sk_••••••••••••"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripePublishable">Publishable Key (pk_...)</Label>
              <Input
                id="stripePublishable"
                type="text"
                value={stripePublishable}
                onChange={(e) => setStripePublishable(e.target.value)}
                placeholder="pk_test_••••••••"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeWebhook">Webhook Secret (whsec_...)</Label>
              <Input
                id="stripeWebhook"
                type="text"
                value={stripeWebhook}
                onChange={(e) => setStripeWebhook(e.target.value)}
                placeholder="whsec_••••••••"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <FeedbackBanner
            status={stripeStatus}
            onClear={() => setStripeStatus(null)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestStripe}
              disabled={testingStripe}
              className="text-xs cursor-pointer"
            >
              {testingStripe ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Verifica Connessione Stripe
            </Button>
            <Button type="button" size="sm" onClick={handleSaveStripe} disabled={savingStripe} className="cursor-pointer">
              {savingStripe && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Credenziali Stripe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
