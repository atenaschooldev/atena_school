"use client";

import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Award,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Euro,
  Calendar,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import { type SchoolProfile } from "@atena/api-types";
import { getCurrentAcademicYear } from "@atena/utils";

interface RegistrationFeeSettingsCardProps {
  onSaved?: (profile: SchoolProfile) => void;
  className?: string;
}

export function RegistrationFeeSettingsCard({ onSaved, className }: RegistrationFeeSettingsCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form state
  const [feeEnabled, setFeeEnabled] = useState<boolean>(true);
  const [feeAmount, setFeeAmount] = useState<number>(30);
  const [academicYear, setAcademicYear] = useState<string>(() => getCurrentAcademicYear().academicYear);

  // Initial loaded state to track unsaved changes
  const [initialState, setInitialState] = useState<{
    enabled: boolean;
    amount: number;
    year: string;
  }>({
    enabled: true,
    amount: 30,
    year: getCurrentAcademicYear().academicYear,
  });

  const academicYearData = useMemo(() => getCurrentAcademicYear(), []);

  const quickYears = useMemo(() => {
    const currYearNum = parseInt(academicYearData.academicYear.split("/")[0], 10) || new Date().getFullYear();
    return [
      {
        year: `${currYearNum - 1}/${currYearNum}`,
        label: `${currYearNum - 1}/${currYearNum}`,
      },
      {
        year: `${currYearNum}/${currYearNum + 1}`,
        label: `${currYearNum}/${currYearNum + 1} (${t("memberships.settings.currentYear") || "Corrente"})`,
        isCurrent: true,
      },
      {
        year: `${currYearNum + 1}/${currYearNum + 2}`,
        label: `${currYearNum + 1}/${currYearNum + 2} (${t("memberships.settings.nextYear") || "Successivo"})`,
      },
    ];
  }, [academicYearData, t]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      feeEnabled !== initialState.enabled ||
      feeAmount !== initialState.amount ||
      academicYear !== initialState.year
    );
  }, [feeEnabled, feeAmount, academicYear, initialState]);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get<{
          success: boolean;
          profile: SchoolProfile;
        }>("/admin/settings/school-profile");
        if (isMounted && res?.profile) {
          const enabled = res.profile.registration_fee_enabled !== false;
          const amount = res.profile.registration_fee_eur ?? 30;
          const year = res.profile.academic_year || getCurrentAcademicYear().academicYear;

          setFeeEnabled(enabled);
          setFeeAmount(amount);
          setAcademicYear(year);

          setInitialState({
            enabled,
            amount,
            year,
          });
        }
      } catch (err) {
        console.warn("[RegistrationFeeSettingsCard] failed to fetch profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (overrides?: {
    enabled?: boolean;
    amount?: number;
    year?: string;
  }) => {
    const nextEnabled = overrides?.enabled !== undefined ? overrides.enabled : feeEnabled;
    const nextAmount = overrides?.amount !== undefined ? overrides.amount : feeAmount;
    const nextYear = overrides?.year !== undefined ? overrides.year : academicYear;

    setSaving(true);
    try {
      const res = await api.patch<{
        success: boolean;
        profile: SchoolProfile;
      }>("/admin/settings/school-profile", {
        registration_fee_enabled: nextEnabled,
        registration_fee_eur: Number(nextAmount),
        academic_year: nextYear,
      });

      if (res?.profile) {
        const enabled = res.profile.registration_fee_enabled !== false;
        const amount = res.profile.registration_fee_eur ?? 30;
        const year = res.profile.academic_year || getCurrentAcademicYear().academicYear;

        setFeeEnabled(enabled);
        setFeeAmount(amount);
        setAcademicYear(year);

        setInitialState({
          enabled,
          amount,
          year,
        });

        queryClient.invalidateQueries({ queryKey: ["school-profile"] });
        onSaved?.(res.profile);
      }

      toast.success(t("memberships.settings.saveSuccess") || "Impostazioni Quota Associativa salvate con successo!");
    } catch (err: any) {
      toast.error(err?.message || t("memberships.settings.saveError") || "Errore durante il salvataggio della quota associativa");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    setFeeEnabled(checked);
    handleSave({ enabled: checked });
  };

  const handlePresetAmount = (preset: number) => {
    setFeeAmount(preset);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      <Card className={`border border-border/80 shadow-xs rounded-xl bg-card ${className || ""}`}>
        {/* Header */}
        <CardHeader className="border-b border-border/60 pb-5 px-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 shadow-2xs flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {t("memberships.settings.title") || "Quota Associativa & Iscrizione Annuale"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("memberships.settings.description") || "Configurazione della quota annuale per studente, anno accademico e verifica del Codice Fiscale."}
                </CardDescription>
              </div>
            </div>

            <div>
              {loading ? (
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 text-xs font-medium">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  {t("common.loading") || "Caricamento..."}
                </Badge>
              ) : feeEnabled ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 py-1 px-3 text-xs font-semibold shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {t("memberships.settings.statusActive", { amount: feeAmount, year: academicYear }) || `Attiva: €${feeAmount} / studente (${academicYear})`}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border flex items-center gap-1.5 py-1 px-3 text-xs font-medium">
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("memberships.settings.statusDisabled") || "Disattivata (Esente per tutti)"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-6 space-y-6">
          {/* 1. Master Toggle Switch */}
          <div className="flex items-start justify-between gap-4 p-4.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-1 pr-2">
              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{t("memberships.settings.toggleTitle") || "Abilita Quota Associativa Obbligatoria"}</span>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("memberships.settings.toggleDesc") || "Quando attiva, il sistema verifica se lo studente ha già pagato la quota per l'anno accademico in corso. Se non è attiva, i corsi possono essere acquistati senza il sovrapprezzo della quota associativa."}
              </p>
            </div>
            <Switch
              disabled={loading || saving}
              checked={feeEnabled}
              onCheckedChange={handleToggle}
              className="cursor-pointer mt-0.5"
            />
          </div>

          {/* 2. Amount and Academic Year Inputs */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${!feeEnabled ? "opacity-60 pointer-events-none" : ""}`}>
            {/* Amount input card */}
            <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Euro className="w-3.5 h-3.5 text-primary" />
                  {t("memberships.settings.feeAmount") || "Importo Quota di Iscrizione (€)"}
                </Label>
              </div>

              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={1}
                  disabled={!feeEnabled || loading || saving}
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="font-bold text-base pl-8 h-10"
                />
                <span className="absolute left-3 top-2.5 text-muted-foreground font-bold text-sm">€</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium mr-1">
                  {t("memberships.settings.presets") || "Preimpostati"}:
                </span>
                {[0, 20, 30, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={!feeEnabled || loading || saving}
                    onClick={() => handlePresetAmount(preset)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                      feeAmount === preset
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                    }`}
                  >
                    €{preset}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {t("memberships.settings.feeAmountHint") || "Importo applicato una sola volta ogni 12 mesi per ciascun Codice Fiscale registrato."}
              </p>
            </div>

            {/* Academic Year input card */}
            <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t("memberships.settings.academicYear") || "Anno Accademico di Riferimento"}
                </Label>
              </div>

              <Input
                type="text"
                placeholder={academicYearData.academicYear}
                disabled={!feeEnabled || loading || saving}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="font-semibold text-sm h-10"
              />

              {/* Quick Year Selectors */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                {quickYears.map((qy) => (
                  <button
                    key={qy.year}
                    type="button"
                    disabled={!feeEnabled || loading || saving}
                    onClick={() => setAcademicYear(qy.year)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                      academicYear === qy.year
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                    }`}
                  >
                    {qy.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground leading-normal">
                {t("memberships.settings.academicYearHint") || "Utilizzato per le ricevute, comunicazioni formali e validità temporale del tesseramento."}
              </p>
            </div>
          </div>

          {/* 3. Action Save Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div>
              {hasUnsavedChanges && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Modifiche non salvate
                </span>
              )}
            </div>

            <Button
              onClick={() => handleSave()}
              disabled={loading || saving || !hasUnsavedChanges}
              className="gap-2 font-bold text-xs px-5 cursor-pointer shadow-2xs"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("memberships.settings.saving") || "Salvataggio in corso..."}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {t("memberships.settings.save") || "Salva Impostazioni Quota"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
