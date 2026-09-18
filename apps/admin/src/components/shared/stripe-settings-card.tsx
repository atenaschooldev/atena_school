"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

import { useTranslation } from "@/i18n/context";

export function StripeSettingsCard() {
  const { t } = useTranslation();
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; settings: { stripeEnabled: boolean } }>("/admin/settings/payment-gateway");
        if (isMounted && res?.settings) {
          setStripeEnabled(Boolean(res.settings.stripeEnabled));
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

  const handleToggle = async (checked: boolean) => {
    setUpdating(true);
    // Optimistic UI update
    const previous = stripeEnabled;
    setStripeEnabled(checked);

    try {
      const res = await api.patch<{ success: boolean; settings: { stripeEnabled: boolean } }>("/admin/settings/payment-gateway", {
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
      setUpdating(false);
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
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
          <div className="space-y-1">
            <div className="font-semibold text-sm flex items-center gap-2">
              <span>{t("settings.toggleStripe")}</span>
              {updating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {stripeEnabled
                ? t("settings.stripeLiveDesc")
                : t("settings.stripeDisabledDesc")}
            </p>
          </div>
          <Switch
            disabled={loading || updating}
            checked={stripeEnabled}
            onCheckedChange={handleToggle}
            className="cursor-pointer mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
