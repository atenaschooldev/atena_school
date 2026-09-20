"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Send,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { MaskedIntegrationSecretRecord, TestIntegrationResult } from "@atena/api-types";

export function WhiteLabelIntegrations() {
  const [loading, setLoading] = useState<boolean>(true);
  const [integrations, setIntegrations] = useState<Record<string, MaskedIntegrationSecretRecord>>({});

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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.get<Record<string, MaskedIntegrationSecretRecord>>("/admin/integrations");
      if (data) {
        setIntegrations(data);
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
    } catch (err: any) {
      console.warn("Failed to load integrations:", err);
      toast.error(err.message || "Errore durante il caricamento delle integrazioni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      toast.success("Credenziali Resend aggiornate con successo!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Errore nel salvataggio di Resend");
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
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Test email fallito");
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
      toast.success("Credenziali Telegram salvate con successo!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Errore nel salvataggio di Telegram");
    } finally {
      setSavingTg(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTg(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/telegram", {});
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Test messaggio Telegram fallito");
    } finally {
      setTestingTg(false);
    }
  };

  const handleSetTelegramWebhook = async () => {
    setSettingWebhook(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/telegram/set-webhook", {});
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Registrazione webhook fallita");
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
      toast.success("Credenziali Stripe salvate con successo!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Errore nel salvataggio di Stripe");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleTestStripe = async () => {
    setTestingStripe(true);
    try {
      const res = await api.post<TestIntegrationResult>("/admin/integrations/test/stripe", {});
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Verifica Stripe fallita");
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
              <div className="relative">
                <Input
                  id="resendApiKey"
                  type="text"
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_••••••••••••"
                  className="font-mono text-sm"
                />
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

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestResend}
              disabled={testingResend}
              className="text-xs"
            >
              {testingResend ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Invia Email di Test
            </Button>
            <Button size="sm" onClick={handleSaveResend} disabled={savingResend}>
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
                placeholder="-100••••••••"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestTelegram}
                disabled={testingTg}
                className="text-xs"
              >
                {testingTg ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Invia Test Telegram
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSetTelegramWebhook}
                disabled={settingWebhook}
                className="text-xs"
              >
                {settingWebhook ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                )}
                Registra Webhook Bot
              </Button>
            </div>
            <Button size="sm" onClick={handleSaveTelegram} disabled={savingTg}>
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

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestStripe}
              disabled={testingStripe}
              className="text-xs"
            >
              {testingStripe ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Verifica Connessione Stripe
            </Button>
            <Button size="sm" onClick={handleSaveStripe} disabled={savingStripe}>
              {savingStripe && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salva Credenziali Stripe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
