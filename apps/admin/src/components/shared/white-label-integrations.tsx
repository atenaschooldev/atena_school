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
  BarChart3,
  Eye,
  EyeOff,
  Bell,
  Globe,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [analyticsStatus, setAnalyticsStatus] = useState<StatusFeedback | null>(null);
  const [domainsStatus, setDomainsStatus] = useState<StatusFeedback | null>(null);

  // Form states
  const [resendKey, setResendKey] = useState("");
  const [resendFrom, setResendFrom] = useState("");
  const [resendAdminEmail, setResendAdminEmail] = useState("");
  const [savingResend, setSavingResend] = useState(false);
  const [testingResend, setTestingResend] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);

  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgLocale, setTgLocale] = useState<"it" | "en" | "ru">("it");
  const [savingTg, setSavingTg] = useState(false);
  const [testingTg, setTestingTg] = useState(false);
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [tgNotifyBookings, setTgNotifyBookings] = useState(true);
  const [tgNotifyPayments, setTgNotifyPayments] = useState(true);
  const [tgNotifyCash, setTgNotifyCash] = useState(true);
  const [tgNotifyLeads, setTgNotifyLeads] = useState(true);

  const [stripeSecret, setStripeSecret] = useState("");
  const [stripePublishable, setStripePublishable] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [savingStripe, setSavingStripe] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripePublishable, setShowStripePublishable] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);

  const [gaId, setGaId] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [clarityId, setClarityId] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [savingAnalytics, setSavingAnalytics] = useState(false);
  const [testingAnalytics, setTestingAnalytics] = useState(false);

  const [siteUrl, setSiteUrl] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [savingDomains, setSavingDomains] = useState(false);
  const [testingDomains, setTestingDomains] = useState(false);

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
            setTgNotifyBookings(data.telegram.credentials.notifyBookings !== false);
            setTgNotifyPayments(data.telegram.credentials.notifyPayments !== false);
            setTgNotifyCash(data.telegram.credentials.notifyCash !== false);
            setTgNotifyLeads(data.telegram.credentials.notifyLeads !== false);
          }
          if (data.stripe?.credentials) {
            setStripeSecret(String(data.stripe.credentials.secretKey || ""));
            setStripePublishable(String(data.stripe.credentials.publishableKey || ""));
            setStripeWebhook(String(data.stripe.credentials.webhookSecret || ""));
          }
          if (data.analytics?.credentials) {
            setGaId(String(data.analytics.credentials.gaId || ""));
            setGtmId(String(data.analytics.credentials.gtmId || ""));
            setClarityId(String(data.analytics.credentials.clarityId || ""));
            setMetaPixelId(String(data.analytics.credentials.metaPixelId || ""));
          }
          if (data.domains?.credentials) {
            setSiteUrl(String(data.domains.credentials.siteUrl || ""));
            setAppUrl(String(data.domains.credentials.appUrl || ""));
            setAdminUrl(String(data.domains.credentials.adminUrl || ""));
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
      const chatIdsList = tgChatId
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      await api.patch("/admin/integrations/telegram", {
        credentials: {
          botToken: tgToken,
          chatId: tgChatId,
          chatIds: chatIdsList,
          locale: tgLocale,
          notifyBookings: tgNotifyBookings,
          notifyPayments: tgNotifyPayments,
          notifyCash: tgNotifyCash,
          notifyLeads: tgNotifyLeads,
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

  // Handlers for Analytics
  const handleSaveAnalytics = async () => {
    setSavingAnalytics(true);
    try {
      await api.patch("/admin/integrations/analytics", {
        credentials: {
          gaId,
          gtmId,
          clarityId,
          metaPixelId,
        },
      });
      const now = new Date().toLocaleTimeString("it-IT");
      setAnalyticsStatus({
        type: "success",
        message: "Configurazione Analytics salvata con successo nel Database!",
        timestamp: now,
      });
      toast.success("Configurazione Analytics salvata nel Database!");
      await loadData(false);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setAnalyticsStatus({
        type: "error",
        message: "Impossibile salvare i tag di Analytics",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSavingAnalytics(false);
    }
  };

  const handleTestAnalytics = async () => {
    setTestingAnalytics(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/analytics", {});
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setAnalyticsStatus({
          type: "success",
          message: res.message,
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setAnalyticsStatus({
          type: "error",
          message: res.message || "Verifica Analytics fallita",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setAnalyticsStatus({
        type: "error",
        message: "Errore durante la verifica dei tag Analytics",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setTestingAnalytics(false);
    }
  };

  // Handlers for Domains
  const handleSaveDomains = async () => {
    setSavingDomains(true);
    try {
      await api.patch("/admin/integrations/domains", {
        credentials: {
          siteUrl,
          appUrl,
          adminUrl,
        },
      });
      const now = new Date().toLocaleTimeString("it-IT");
      setDomainsStatus({
        type: "success",
        message: "Domini e URL della scuola salvati con successo nel Database!",
        timestamp: now,
      });
      toast.success("Domini e URL della scuola salvati nel Database!");
      await loadData(false);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setDomainsStatus({
        type: "error",
        message: "Impossibile salvare la configurazione dei domini",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setSavingDomains(false);
    }
  };

  const handleTestDomains = async () => {
    setTestingDomains(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/domains", {});
      const now = new Date().toLocaleTimeString("it-IT");
      if (res.success) {
        setDomainsStatus({
          type: "success",
          message: res.message,
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.success(res.message);
      } else {
        setDomainsStatus({
          type: "error",
          message: res.message || "Verifica URL fallita",
          details: JSON.stringify(res.details || {}, null, 2),
          timestamp: now,
        });
        toast.error(res.message);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setDomainsStatus({
        type: "error",
        message: "Errore durante la verifica dei domini",
        details: errMsg,
        timestamp: new Date().toLocaleTimeString("it-IT"),
      });
      toast.error(errMsg);
    } finally {
      setTestingDomains(false);
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
  const analyticsInfo = integrations.analytics;
  const domainsInfo = integrations.domains;

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
              <div className="relative">
                <Input
                  id="resendApiKey"
                  type={showResendKey ? "text" : "password"}
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_••••••••••••"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowResendKey(!showResendKey)}
                  title={showResendKey ? "Nascondi chiave" : "Mostra chiave"}
                >
                  {showResendKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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
              <div className="relative">
                <Input
                  id="tgToken"
                  type={showTgToken ? "text" : "password"}
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="123456789:AA••••••••"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowTgToken(!showTgToken)}
                  title={showTgToken ? "Nascondi token" : "Mostra token"}
                >
                  {showTgToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgChatId">Chat ID Amministratori (Multipli)</Label>
              <Input
                id="tgChatId"
                type="text"
                value={tgChatId}
                onChange={(e) => setTgChatId(e.target.value)}
                placeholder="es. 7159974353, -100123456789"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Puoi inserire più Chat ID separati da virgola. Il bot invierà tutte le notifiche contemporaneamente a ciascun amministratore.
              </p>
            </div>

            {/* Notification Event Filters */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Filtro Notifiche Telegram</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Scegli quali eventi devono attivare un messaggio automatico nel canale o chat degli amministratori:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-start space-x-3 p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background cursor-pointer transition-colors">
                  <Checkbox
                    checked={tgNotifyBookings}
                    onCheckedChange={(checked) => setTgNotifyBookings(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block text-foreground">Nuove Prenotazioni</span>
                    <span className="text-[11px] text-muted-foreground block leading-tight">
                      Avviso immediato per ogni nuova iscrizione registrata dal sito
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background cursor-pointer transition-colors">
                  <Checkbox
                    checked={tgNotifyPayments}
                    onCheckedChange={(checked) => setTgNotifyPayments(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block text-foreground">Pagamenti Online Stripe</span>
                    <span className="text-[11px] text-muted-foreground block leading-tight">
                      Conferma quando un cliente paga online con carta di credito
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background cursor-pointer transition-colors">
                  <Checkbox
                    checked={tgNotifyCash}
                    onCheckedChange={(checked) => setTgNotifyCash(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block text-foreground">Saldo in Sede (Contanti)</span>
                    <span className="text-[11px] text-muted-foreground block leading-tight">
                      Avviso quando la prenotazione richiede saldo di persona
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-3 rounded-lg border border-border/60 bg-background/60 hover:bg-background cursor-pointer transition-colors">
                  <Checkbox
                    checked={tgNotifyLeads}
                    onCheckedChange={(checked) => setTgNotifyLeads(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold block text-foreground">Lead & Modulo Contatti</span>
                    <span className="text-[11px] text-muted-foreground block leading-tight">
                      Messaggi e richieste di informazioni inviati dal modulo contatti
                    </span>
                  </div>
                </label>
              </div>
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
              <div className="relative">
                <Input
                  id="stripeSecret"
                  type={showStripeSecret ? "text" : "password"}
                  value={stripeSecret}
                  onChange={(e) => setStripeSecret(e.target.value)}
                  placeholder="sk_••••••••••••"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  title={showStripeSecret ? "Nascondi chiave" : "Mostra chiave"}
                >
                  {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripePublishable">Publishable Key (pk_...)</Label>
              <div className="relative">
                <Input
                  id="stripePublishable"
                  type={showStripePublishable ? "text" : "password"}
                  value={stripePublishable}
                  onChange={(e) => setStripePublishable(e.target.value)}
                  placeholder="pk_test_••••••••"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowStripePublishable(!showStripePublishable)}
                  title={showStripePublishable ? "Nascondi chiave" : "Mostra chiave"}
                >
                  {showStripePublishable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripeWebhook">Webhook Secret (whsec_...)</Label>
              <div className="relative">
                <Input
                  id="stripeWebhook"
                  type={showStripeWebhook ? "text" : "password"}
                  value={stripeWebhook}
                  onChange={(e) => setStripeWebhook(e.target.value)}
                  placeholder="whsec_••••••••"
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                  title={showStripeWebhook ? "Nascondi secret" : "Mostra secret"}
                >
                  {showStripeWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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

      {/* Web Analytics Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Web Analytics & Tracking (GA4, GTM, Clarity, Pixel)</CardTitle>
                <CardDescription>
                  ID di monitoraggio e pixel di conversione per Google, Microsoft e Meta (Facebook)
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={analyticsInfo?.source === "database" ? "default" : "secondary"}>
                {analyticsInfo?.source === "database" ? "Database (White-label)" : "ENV Fallback"}
              </Badge>
              <Badge variant={analyticsInfo?.is_configured ? "outline" : "destructive"}>
                {analyticsInfo?.is_configured ? "Configurato" : "Mancante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gaId">Google Analytics 4 Measurement ID</Label>
              <Input
                id="gaId"
                type="text"
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Es. <code>G-JN8BKKJ1D6</code> per tracciare visualizzazioni e conversioni
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gtmId">Google Tag Manager Container ID</Label>
              <Input
                id="gtmId"
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Es. <code>GTM-W2LB54V8</code> per la gestione centralizzata dei tag
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clarityId">Microsoft Clarity Project ID</Label>
              <Input
                id="clarityId"
                type="text"
                value={clarityId}
                onChange={(e) => setClarityId(e.target.value)}
                placeholder="xxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Es. <code>xo2pxnhx79</code> per heatmap e registrazioni sessioni
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaPixelId">Meta / Facebook Pixel ID</Label>
              <Input
                id="metaPixelId"
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="123456789012345"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                ID numerico del pixel per tracciare campagne adv Meta
              </p>
            </div>
          </div>

          <FeedbackBanner
            status={analyticsStatus}
            onClear={() => setAnalyticsStatus(null)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAnalytics}
              disabled={testingAnalytics}
              className="text-xs cursor-pointer"
            >
              {testingAnalytics ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Verifica Tag Analytics
            </Button>
            <Button type="button" size="sm" onClick={handleSaveAnalytics} disabled={savingAnalytics} className="cursor-pointer">
              {savingAnalytics && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Configurazione Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Official Domains & URLs Card */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Domini & URL Ufficiali (White-Label)</CardTitle>
                <CardDescription>
                  Indirizzi web della scuola per pulsanti email (Resend), link del bot Telegram e navigazione tra portali
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={domainsInfo?.source === "database" ? "default" : "secondary"}>
                {domainsInfo?.source === "database" ? "Database (White-label)" : "ENV Fallback"}
              </Badge>
              <Badge variant={domainsInfo?.is_configured ? "outline" : "destructive"}>
                {domainsInfo?.is_configured ? "Configurato" : "Mancante"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">URL Sito Web / Vetrina</Label>
              <Input
                id="siteUrl"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://atenaschool.com"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Dominio pubblico del catalogo corsi e della vetrina
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appUrl">URL Portale Studenti</Label>
              <Input
                id="appUrl"
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://app.atenaschool.com"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Usato nei pulsanti &quot;Accedi al tuo account&quot; nelle email di conferma
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminUrl">URL Portale CRM Admin</Label>
              <Input
                id="adminUrl"
                type="url"
                value={adminUrl}
                onChange={(e) => setAdminUrl(e.target.value)}
                placeholder="https://atena-school-admin.vercel.app"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Usato nei pulsanti &quot;Admin CRM&quot; delle notifiche del bot Telegram
              </p>
            </div>
          </div>

          <FeedbackBanner
            status={domainsStatus}
            onClear={() => setDomainsStatus(null)}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestDomains}
              disabled={testingDomains}
              className="text-xs cursor-pointer"
            >
              {testingDomains ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Globe className="h-3.5 w-3.5 mr-1.5" />
              )}
              Verifica URL & Connessione
            </Button>
            <Button type="button" size="sm" onClick={handleSaveDomains} disabled={savingDomains} className="cursor-pointer">
              {savingDomains && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Domini & URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
