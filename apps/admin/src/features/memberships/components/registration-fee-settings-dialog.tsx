"use client";

import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export interface RegistrationFeeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (profile: SchoolProfile) => void;
}

export function RegistrationFeeSettingsDialog({
  open,
  onOpenChange,
  onSaved,
}: RegistrationFeeSettingsDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form state
  const [feeEnabled, setFeeEnabled] = useState<boolean>(true);
  const [feeAmount, setFeeAmount] = useState<number>(30);
  const [academicYear, setAcademicYear] = useState<string>(() => getCurrentAcademicYear().academicYear);

  // Initial state for diffing
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
    if (!open) return;
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
        console.warn("[RegistrationFeeSettingsDialog] failed to fetch profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch<{
        success: boolean;
        profile: SchoolProfile;
      }>("/admin/settings/school-profile", {
        registration_fee_enabled: feeEnabled,
        registration_fee_eur: Number(feeAmount),
        academic_year: academicYear,
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
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || t("memberships.settings.saveError") || "Errore durante il salvataggio della quota associativa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 shadow-2xs flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {t("memberships.settings.title") || "Quota Associativa & Iscrizione Annuale"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("memberships.settings.description") || "Configurazione della quota annuale per studente e anno accademico."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Master Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="space-y-1 pr-2">
              <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{t("memberships.settings.toggleTitle") || "Abilita Quota Associativa Obbligatoria"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("memberships.settings.toggleDesc") || "Quando attiva, il sistema verifica se lo studente ha già pagato la quota per l'anno accademico in corso."}
              </p>
            </div>
            <Switch
              disabled={loading || saving}
              checked={feeEnabled}
              onCheckedChange={setFeeEnabled}
              className="cursor-pointer mt-0.5"
            />
          </div>

          {/* Configuration Form */}
          <div className={`space-y-4 transition-opacity ${!feeEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Amount input */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-background shadow-2xs">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Euro className="w-3.5 h-3.5 text-primary" />
                {t("memberships.settings.feeAmount") || "Importo Quota di Iscrizione (€)"}
              </Label>

              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={1}
                  disabled={!feeEnabled || loading || saving}
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="font-bold text-base pl-8 h-9"
                />
                <span className="absolute left-3 top-2 text-muted-foreground font-bold text-sm">€</span>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-medium mr-1">
                  {t("memberships.settings.presets") || "Preimpostati"}:
                </span>
                {[0, 20, 30, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={!feeEnabled || loading || saving}
                    onClick={() => setFeeAmount(preset)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                      feeAmount === preset
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                    }`}
                  >
                    €{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Year input */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-background shadow-2xs">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t("memberships.settings.academicYear") || "Anno Accademico di Riferimento"}
              </Label>

              <Input
                type="text"
                placeholder={academicYearData.academicYear}
                disabled={!feeEnabled || loading || saving}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="font-semibold text-sm h-9"
              />

              {/* Quick Year Selectors */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                {quickYears.map((qy) => (
                  <button
                    key={qy.year}
                    type="button"
                    disabled={!feeEnabled || loading || saving}
                    onClick={() => setAcademicYear(qy.year)}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                      academicYear === qy.year
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                    }`}
                  >
                    {qy.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 bg-muted/20 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="text-xs cursor-pointer"
          >
            {t("memberships.dialog.cancel") || "Annulla"}
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading || saving}
            size="sm"
            className="gap-1.5 font-bold text-xs cursor-pointer shadow-2xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("memberships.settings.saving") || "Salvataggio..."}
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {t("memberships.settings.save") || "Salva Impostazioni"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
