"use client";

import { useEffect, useState } from "react";
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
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Euro,
  Calendar,
  Info,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n/context";
import { DEFAULT_SCHOOL_PROFILE, type SchoolProfile } from "@atena/api-types";
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

  const [feeEnabled, setFeeEnabled] = useState<boolean>(true);
  const [feeAmount, setFeeAmount] = useState<number>(30);
  const [academicYear, setAcademicYear] = useState<string>(() => getCurrentAcademicYear().academicYear);

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
          setFeeEnabled(res.profile.registration_fee_enabled !== false);
          setFeeAmount(res.profile.registration_fee_eur ?? 30);
          setAcademicYear(res.profile.academic_year || getCurrentAcademicYear().academicYear);
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
        setFeeEnabled(res.profile.registration_fee_enabled !== false);
        setFeeAmount(res.profile.registration_fee_eur ?? 30);
        setAcademicYear(res.profile.academic_year || getCurrentAcademicYear().academicYear);
        queryClient.invalidateQueries({ queryKey: ["school-profile"] });
        onSaved?.(res.profile);
      }

      toast.success("Impostazioni Quota Associativa salvate con successo!");
    } catch (err: any) {
      toast.error(err?.message || "Errore durante il salvataggio della quota associativa");
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
    <Card className={`border-2 border-amber-500/20 shadow-sm overflow-hidden bg-white ${className || ""}`}>
      <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Quota Associativa & Iscrizione Annuale
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configurazione della quota annuale per studente, anno scolastico e verifica del Codice Fiscale.
              </CardDescription>
            </div>
          </div>

          <div>
            {loading ? (
              <Badge variant="outline" className="flex items-center gap-1.5 py-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Caricamento...
              </Badge>
            ) : feeEnabled ? (
              <Badge className="bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25 border-emerald-300 flex items-center gap-1.5 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Attiva: €{feeAmount} / studente ({academicYear})
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1.5 py-1 px-3">
                <XCircle className="h-3.5 w-3.5 text-slate-500" />
                Disattivata (Esente per tutti)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* 1. Master Toggle Switch */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Abilita Quota Associativa Obbligatoria</span>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Quando attiva, il motore di checkout verifica se lo studente (o il minore in caso di iscrizione da parte di un genitore) ha già pagato la quota per l&apos;anno accademico in corso. Se non è attiva, tutti i corsi possono essere acquistati senza il sovrapprezzo della quota associativa.
            </p>
          </div>
          <Switch
            disabled={loading || saving}
            checked={feeEnabled}
            onCheckedChange={handleToggle}
            className="cursor-pointer mt-1"
          />
        </div>

        {/* 2. Amount and Academic Year Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-slate-200 bg-white">
          {/* Amount input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-amber-600" />
              Importo Quota di Iscrizione (€)
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
                className="font-bold text-base pl-8"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">€</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Preimpostati:</span>
              {[0, 20, 30, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={!feeEnabled || loading || saving}
                  onClick={() => handlePresetAmount(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    feeAmount === preset
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  €{preset}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Importo applicato una sola volta ogni 12 mesi per ciascun Codice Fiscale registrato.
            </p>
          </div>

          {/* Academic Year input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Anno Accademico di Riferimento
            </Label>
            <Input
              type="text"
              placeholder={getCurrentAcademicYear().academicYear}
              disabled={loading || saving}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="font-bold text-sm"
            />
            <p className="text-[11px] text-slate-500">
              Utilizzato per le comunicazioni formali, le ricevute e la validità temporale del tesseramento.
            </p>
          </div>
        </div>

        {/* 3. Italian Legal Notice Callout */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <div className="font-bold text-blue-950">Normativa Fiscale & Regole Business Italia:</div>
            <p className="text-blue-800">
              La quota associativa annuale è esente IVA (Art. 148 TUIR / DPR 633/72). Quando un genitore iscrive un figlio (<code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono text-[11px]">isForChild = true</code>), la verifica dello stato di pagamento avviene rigorosamente sul <strong>Codice Fiscale del minore</strong>, mentre i dati di fatturazione e il pagamento vengono intestati al genitore/acquirente.
            </p>
          </div>
        </div>

        {/* 4. Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => handleSave()}
            disabled={loading || saving}
            className="gap-2 bg-[#043569] text-white hover:bg-[#032850] font-bold text-xs px-5 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Salvataggio in corso...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Salva Impostazioni Quota
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
