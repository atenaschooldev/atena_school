"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

type CookieSelection = {
  mandatory: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selection, setSelection] = useState<CookieSelection>({
    mandatory: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allSelected = { mandatory: true, analytics: true, marketing: true };
    saveConsent(allSelected);
  };

  const handleDeclineAll = () => {
    const onlyMandatory = { mandatory: true, analytics: false, marketing: false };
    saveConsent(onlyMandatory);
  };

  const handleSaveSettings = () => {
    saveConsent(selection);
  };

  const saveConsent = (data: CookieSelection) => {
    localStorage.setItem("cookie-consent", JSON.stringify(data));
    setIsVisible(false);
    // Force a reload or notify other components if needed
    window.dispatchEvent(new Event("cookie-consent-updated"));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-background/95 backdrop-blur-md border-t shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {!showSettings ? (
          <>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold mb-2 text-primary">{t("title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {t("description")}{" "}
                <Link href="/cookies" className="underline font-medium hover:text-primary transition-colors">
                  {t("categories.mandatory.title")}
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => setShowSettings(true)}>
                {t("settings")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeclineAll}>
                {t("decline")}
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("acceptAll")}
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary">{t("settings")}</h3>
                <p className="text-sm text-muted-foreground">Personalizza le tue preferenze sulla privacy</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                &larr; Indietro
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mandatory */}
              <div className="flex items-start space-x-4 p-4 rounded-xl border bg-muted/30">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-semibold">{t("categories.mandatory.title")}</Label>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {t("categories.mandatory.description")}
                  </p>
                </div>
                <Switch checked disabled aria-label="Necessary cookies" />
              </div>

              {/* Analytics */}
              <div className="flex items-start space-x-4 p-4 rounded-xl border hover:border-primary/50 transition-colors">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-semibold">{t("categories.analytics.title")}</Label>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {t("categories.analytics.description")}
                  </p>
                </div>
                <Switch 
                  checked={selection.analytics} 
                  onCheckedChange={(val) => setSelection(prev => ({ ...prev, analytics: val }))} 
                  aria-label="Analytics cookies"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-start space-x-4 p-4 rounded-xl border hover:border-primary/50 transition-colors">
                <div className="flex-1 space-y-1">
                  <Label className="text-sm font-semibold">{t("categories.marketing.title")}</Label>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {t("categories.marketing.description")}
                  </p>
                </div>
                <Switch 
                  checked={selection.marketing} 
                  onCheckedChange={(val) => setSelection(prev => ({ ...prev, marketing: val }))} 
                  aria-label="Marketing cookies"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveSettings} className="px-8 bg-primary">
                {t("save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
