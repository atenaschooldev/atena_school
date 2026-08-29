"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function StripeSettingsCard() {
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; settings: { stripeEnabled: boolean } }>("/checkout/settings");
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
      const res = await api.patch<{ success: boolean; settings: { stripeEnabled: boolean } }>("/checkout/settings", {
        stripeEnabled: checked,
      });

      if (res?.settings) {
        setStripeEnabled(Boolean(res.settings.stripeEnabled));
      }

      toast.success(
        checked
          ? "Stripe Online abilitato: i clienti possono pagare online con carta"
          : "Stripe Online disattivato: i clienti possono solo prenotare con saldo in sede"
      );
    } catch (err: any) {
      setStripeEnabled(previous);
      toast.error(err?.message || "Impossibile aggiornare l'impostazione Stripe");
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
              <CardTitle className="text-lg font-bold">Gateway di Pagamento Stripe</CardTitle>
              <CardDescription>
                Controlla la disponibilità dei pagamenti con carta / Stripe sul sito web
              </CardDescription>
            </div>
          </div>
          <div>
            {loading ? (
              <Badge variant="outline" className="flex items-center gap-1.5 py-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Caricamento...
              </Badge>
            ) : stripeEnabled ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-300 flex items-center gap-1.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Attivo • Paga Online Abilitato
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-800 border-amber-300 flex items-center gap-1.5 py-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                Disattivato • Solo Pagamento in Sede
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-card">
          <div className="space-y-1">
            <div className="font-semibold text-sm flex items-center gap-2">
              <span>Abilita pagamenti online con carta (Stripe)</span>
              {updating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {stripeEnabled
                ? "Attualmente attivo. I clienti possono scegliere di saldare online con carta / Apple Pay o prenotare con saldo in sede."
                : "Attualmente disattivato (modalità MVP). Sul sito web viene offerta esclusivamente l'opzione 'Prenota e paga in sede', senza richiedere pagamenti con carta online."}
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
