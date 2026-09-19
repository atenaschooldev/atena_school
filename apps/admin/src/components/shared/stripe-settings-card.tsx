"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldAlert, ShieldCheck, Loader2, Repeat, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";

export function StripeSettingsCard() {
  const { t } = useTranslation();
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(false);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStripe, setUpdatingStripe] = useState<boolean>(false);
  const [updatingSubscriptions, setUpdatingSubscriptions] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get<{
          success: boolean;
          settings: { stripeEnabled: boolean; subscriptionsEnabled: boolean };
        }>("/admin/settings/payment-gateway");
        if (isMounted && res?.settings) {
          setStripeEnabled(Boolean(res.settings.stripeEnabled));
          setSubscriptionsEnabled(Boolean(res.settings.subscriptionsEnabled));
        }
      } catch (err) {
        console.warn("[StripeSettingsCard] failed to fetch settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleStripe = async (checked: boolean) => {
    setUpdatingStripe(true);
    const previous = stripeEnabled;
    setStripeEnabled(checked);

    try {
      const res = await api.patch<{
        success: boolean;
        settings: { stripeEnabled: boolean; subscriptionsEnabled: boolean };
      }>("/admin/settings/payment-gateway", {
        stripeEnabled: checked,
      });

      if (res?.settings) {
        setStripeEnabled(Boolean(res.settings.stripeEnabled));
      }

      toast.success(
        checked
          ? t("settings.stripeLiveDesc")
          : t("settings.stripeDisabledDesc")
      );
    } catch (err: any) {
      setStripeEnabled(previous);
      toast.error(err?.message || t("common.error"));
    } finally {
      setUpdatingStripe(false);
    }
  };

  const handleToggleSubscriptions = async (checked: boolean) => {
    setUpdatingSubscriptions(true);
    const previous = subscriptionsEnabled;
    setSubscriptionsEnabled(checked);

    try {
      const res = await api.patch<{
        success: boolean;
        settings: { stripeEnabled: boolean; subscriptionsEnabled: boolean };
      }>("/admin/settings/payment-gateway", {
        subscriptionsEnabled: checked,
      });

      if (res?.settings) {
        setSubscriptionsEnabled(Boolean(res.settings.subscriptionsEnabled));
      }

      toast.success(
        checked
          ? t("settings.subscriptionsLiveDesc")
          : t("settings.subscriptionsDisabledDesc")
      );
    } catch (err: any) {
      setSubscriptionsEnabled(previous);
      toast.error(err?.message || t("common.error"));
    } finally {
      setUpdatingSubscriptions(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{t("settings.stripeGateway")}</CardTitle>
              <CardDescription>
                {t("settings.stripeDescription")}
              </CardDescription>
            </div>
          </div>
          <div>
            {loading ? (
              <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("common.loading")}
              </Badge>
            ) : stripeEnabled ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-300 flex items-center gap-1.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {t("settings.stripeEnabledTitle")}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-800 border-amber-300 flex items-center gap-1.5 py-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                {t("settings.stripeDisabledTitle")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {/* 1. Toggle Stripe Online Payments */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
          <div className="space-y-1">
            <div className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>{t("settings.toggleStripe")}</span>
              {updatingStripe && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {stripeEnabled
                ? t("settings.stripeLiveDesc")
                : t("settings.stripeDisabledDesc")}
            </p>
          </div>
          <Switch
            disabled={loading || updatingStripe}
            checked={stripeEnabled}
            onCheckedChange={handleToggleStripe}
            className="cursor-pointer mt-1"
          />
        </div>

        {/* 2. Toggle Recurring Subscriptions */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Repeat className="h-4 w-4 text-indigo-500" />
                <span>{t("settings.subscriptionsGateway")}</span>
                {updatingSubscriptions && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              {subscriptionsEnabled ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 text-[10px] font-bold border-emerald-300/50 py-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-emerald-600" />
                  Attivo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground text-[10px] py-0.5">
                  <XCircle className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                  Disattivato
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {subscriptionsEnabled
                ? t("settings.subscriptionsLiveDesc")
                : t("settings.subscriptionsDisabledDesc")}
            </p>
          </div>
          <Switch
            disabled={loading || updatingSubscriptions}
            checked={subscriptionsEnabled}
            onCheckedChange={handleToggleSubscriptions}
            className="cursor-pointer mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
