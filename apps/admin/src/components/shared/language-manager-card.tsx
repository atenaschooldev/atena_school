"use client";

import React, { useState, useMemo } from "react";
import { useTranslation, type LanguageItem } from "@/i18n/context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Languages,
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  Sparkles,
  Globe,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";

interface LanguagePreset {
  code: string;
  label: string;
  flag: string;
}

const POPULAR_PRESETS: LanguagePreset[] = [
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

export function LanguageManagerCard() {
  const {
    locale,
    setLocale,
    languages,
    customLocales,
    importCustomLocale,
    deleteCustomLocale,
    exportDictionaryJson,
    exportMasterDictionary,
    t,
  } = useTranslation();

  const [activeTab, setActiveTab] = useState<"installed" | "wizard">("installed");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Form states for importing
  const [langCode, setLangCode] = useState("pl");
  const [langLabel, setLangLabel] = useState("Polski");
  const [langFlag, setLangFlag] = useState("🇵🇱");
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
    totalKeys: number;
    matchedKeys: number;
    coveragePercent: number;
  } | null>(null);

  // Download dictionary as JSON file
  const handleDownload = (lang: "en" | "it" = "en") => {
    try {
      const dataStr = exportDictionaryJson(lang);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `atena-${lang}-dictionary.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Dizionario master (${lang.toUpperCase()}) scaricato con successo!`);
    } catch (e: any) {
      toast.error("Errore durante il download del dizionario: " + e.message);
    }
  };

  // Pre-crafted AI Prompt
  const masterAiPrompt = useMemo(() => {
    return `You are a professional localization and translation specialist for "Atena School", a SaaS CRM for language schools and educational academies.

Your task is to translate the JSON values below from English to ${langLabel || "the target language"} (${langCode || "locale"}).

STRICT TRANSLATION RULES:
1. Output format MUST be strictly valid JSON without markdown wrapping (e.g. no \`\`\`json codeblocks, just raw parseable JSON).
2. Keep all JSON keys and object structure 100% IDENTICAL to the source. Do NOT rename, remove, or add keys.
3. NEVER translate or change template variables/placeholders such as {{name}}, {{count}}, {{amount}}, {{year}}, {{date}}, {amount}, {year}, {school_name}.
4. Provide natural, idiomatic translations suitable for school administrators, teachers, and staff.
5. Translate only the string values.

Source English JSON structure:
${exportDictionaryJson("en")}`;
  }, [langCode, langLabel, exportDictionaryJson]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(masterAiPrompt);
      setCopiedPrompt(true);
      toast.success("Prompt AI completo copiato negli appunti!");
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (e) {
      toast.error("Impossibile copiare negli appunti.");
    }
  };

  // Validate JSON string live
  const handleValidateJson = (text: string) => {
    setJsonInput(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setValidationResult({
          valid: false,
          error: "Il JSON deve essere un oggetto con i moduli di traduzione (nav, common, ecc.).",
          totalKeys: 0,
          matchedKeys: 0,
          coveragePercent: 0,
        });
        return;
      }

      const master = exportMasterDictionary();
      let totalMasterKeys = 0;
      let matched = 0;

      for (const [modKey, modObj] of Object.entries(master)) {
        if (typeof modObj === "object" && modObj !== null) {
          for (const key of Object.keys(modObj)) {
            totalMasterKeys++;
            if (
              parsed[modKey] &&
              typeof parsed[modKey] === "object" &&
              parsed[modKey][key] &&
              typeof parsed[modKey][key] === "string" &&
              parsed[modKey][key].trim() !== ""
            ) {
              matched++;
            }
          }
        }
      }

      const coveragePercent =
        totalMasterKeys > 0 ? Math.round((matched / totalMasterKeys) * 100) : 100;

      setValidationResult({
        valid: true,
        totalKeys: totalMasterKeys,
        matchedKeys: matched,
        coveragePercent,
      });
    } catch (err: any) {
      setValidationResult({
        valid: false,
        error: "Sintassi JSON non valida: " + (err?.message || "errore di parsing"),
        totalKeys: 0,
        matchedKeys: 0,
        coveragePercent: 0,
      });
    }
  };

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidateJson(content);
    };
    reader.readAsText(file);
  };

  // Apply preset
  const handleSelectPreset = (preset: LanguagePreset) => {
    setLangCode(preset.code);
    setLangLabel(preset.label);
    setLangFlag(preset.flag);
  };

  // Save imported language
  const handleSaveImport = () => {
    if (!validationResult?.valid || !jsonInput.trim()) {
      toast.error("Inserisci un file JSON valido prima di salvare.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const res = importCustomLocale(langCode, langLabel, langFlag, parsed);

      if (res.success) {
        toast.success(
          `Lingua "${langLabel}" (${langCode.toUpperCase()}) installata con successo! (Copertura: ${res.coveragePercent}%)`
        );
        setLocale(langCode);
        setJsonInput("");
        setValidationResult(null);
        setActiveTab("installed");
      } else {
        toast.error(res.error || "Errore durante l'installazione della lingua.");
      }
    } catch (e: any) {
      toast.error("Errore durante l'elaborazione del file: " + e.message);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Globe className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">
                Gestione Lingue & Localizzazione AI
              </CardTitle>
            </div>
            <CardDescription className="text-sm">
              Architettura modulare JSON. Esporta il dizionario master, traducilo istantaneamente con
              qualsiasi modello AI (ChatGPT, Claude, Gemini) e attiva nuove lingue con fallback automatico.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("en")}
              className="gap-2 text-xs font-semibold cursor-pointer border-border/60 hover:bg-accent"
            >
              <Download className="w-4 h-4 text-primary" />
              Esporta Master EN (.json)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("it")}
              className="gap-2 text-xs font-semibold cursor-pointer border-border/60 hover:bg-accent"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Esporta Master IT (.json)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md bg-muted/50 p-1">
            <TabsTrigger
              value="installed"
              className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <Languages className="w-4 h-4" />
              Lingue Installate ({languages.length})
            </TabsTrigger>
            <TabsTrigger
              value="wizard"
              className="gap-2 text-xs font-semibold cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Importa con AI Guide
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: INSTALLED LANGUAGES */}
          <TabsContent value="installed" className="space-y-4 m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((lang) => {
                const isActive = locale === lang.code;
                const isCustom = Boolean(lang.isCustom);
                const customInfo = customLocales[lang.code];

                return (
                  <div
                    key={lang.code}
                    className={`relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between gap-4 ${
                      isActive
                        ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20"
                        : "border-border/60 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-1 bg-muted/40 rounded-lg border border-border/40">
                          {lang.flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-foreground">{lang.label}</h4>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                              {lang.code}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isCustom
                              ? `Importata il ${
                                  customInfo?.createdAt
                                    ? new Date(customInfo.createdAt).toLocaleDateString()
                                    : "recente"
                                }`
                              : "Lingua integrata nel core"}
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1 font-semibold">
                          <Check className="w-3 h-3" />
                          Attiva
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {isCustom ? "Custom" : "Sistema"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        100% Modulare
                      </span>

                      <div className="flex items-center gap-1.5">
                        {!isActive && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setLocale(lang.code);
                              toast.success(`Lingua impostata su ${lang.label}`);
                            }}
                            className="h-8 text-xs cursor-pointer font-medium"
                          >
                            Attiva
                          </Button>
                        )}

                        {isCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (
                                confirm(
                                  `Vuoi davvero eliminare la lingua personalizzata "${lang.label}"?`
                                )
                              ) {
                                deleteCustomLocale(lang.code);
                                toast.info(`Lingua ${lang.label} eliminata.`);
                              }
                            }}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Elimina lingua personalizzata"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-semibold text-sm">Hai bisogno di un'altra lingua?</h4>
                <p className="text-xs text-muted-foreground">
                  Traduci la piattaforma in polacco, spagnolo, tedesco o qualsiasi altra lingua in 2 minuti
                  utilizzando l'AI Guide e il file JSON master.
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("wizard")}
                className="gap-2 shrink-0 cursor-pointer font-semibold shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Avvia Traduzione AI
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: AI TRANSLATION WIZARD & JSON IMPORTER */}
          <TabsContent value="wizard" className="space-y-6 m-0">
            {/* Step 1: Select or create language metadata */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <h3 className="font-bold text-sm text-foreground">
                  Seleziona o Inserisci la Nuova Lingua
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground self-center mr-1">Preset veloci:</span>
                {POPULAR_PRESETS.map((preset) => (
                  <Button
                    key={preset.code}
                    type="button"
                    variant={langCode === preset.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectPreset(preset)}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    <span>{preset.flag}</span>
                    <span>{preset.label}</span>
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Codice Lingua (ISO 639-1)
                  </label>
                  <Input
                    value={langCode}
                    onChange={(e) => setLangCode(e.target.value.toLowerCase().trim())}
                    placeholder="es. pl, es, de, uk"
                    className="font-mono text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nome Visualizzato
                  </label>
                  <Input
                    value={langLabel}
                    onChange={(e) => setLangLabel(e.target.value)}
                    placeholder="es. Polski, Español"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Bandiera (Emoji)
                  </label>
                  <Input
                    value={langFlag}
                    onChange={(e) => setLangFlag(e.target.value)}
                    placeholder="es. 🇵🇱"
                    className="text-sm h-9 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: AI Guide & One-click Prompt */}
            <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Copia il Prompt per ChatGPT, Claude o Gemini
                  </h3>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPrompt}
                  className="gap-2 cursor-pointer bg-background hover:bg-accent border-amber-500/30 text-xs font-semibold shadow-xs"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Prompt Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-500" />
                      Copia Prompt AI Completo
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Il prompt include le istruzioni rigide di localizzazione per preservare le variabili{" "}
                <code className="px-1 py-0.5 rounded bg-muted text-foreground text-[11px]">
                  {"{{name}}"}
                </code>
                ,{" "}
                <code className="px-1 py-0.5 rounded bg-muted text-foreground text-[11px]">
                  {"{amount}"}
                </code>{" "}
                e la struttura JSON delle 21 sezioni. Incollalo nel tuo modello AI preferito e ottieni il JSON tradotto.
              </p>
            </div>

            {/* Step 3: Upload or Paste JSON */}
            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  <h3 className="font-bold text-sm text-foreground">
                    Carica o Incolla il JSON Tradotto
                  </h3>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2 text-xs font-semibold border-border/60 cursor-pointer"
                  >
                    <span>
                      <Upload className="w-4 h-4 text-primary" />
                      Carica file .json
                    </span>
                  </Button>
                </label>
              </div>

              <Textarea
                value={jsonInput}
                onChange={(e) => handleValidateJson(e.target.value)}
                placeholder='Incolla qui il JSON tradotto generato dall&#39;AI (es. { "nav": { ... }, "common": { ... } })...'
                className="font-mono text-xs min-h-[160px] resize-y bg-background"
              />

              {/* Validation Status Bar */}
              {validationResult && (
                <div
                  className={`rounded-lg p-3.5 flex items-start justify-between gap-3 text-xs ${
                    validationResult.valid
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 border border-destructive/30 text-destructive"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {validationResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {validationResult.valid
                          ? `Validazione riuscita! Copertura: ${validationResult.coveragePercent}% (${validationResult.matchedKeys} / ${validationResult.totalKeys} chiavi)`
                          : "Errore di validazione"}
                      </p>
                      {validationResult.error && (
                        <p className="mt-0.5 text-xs opacity-90">{validationResult.error}</p>
                      )}
                      {validationResult.valid && validationResult.coveragePercent < 100 && (
                        <p className="mt-0.5 text-[11px] opacity-80">
                          Le chiavi non tradotte useranno automaticamente il fallback inglese senza crash.
                        </p>
                      )}
                    </div>
                  </div>

                  {validationResult.valid && (
                    <Badge
                      className={`${
                        validationResult.coveragePercent === 100
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {validationResult.coveragePercent}%
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveImport}
                  disabled={!validationResult?.valid}
                  className="gap-2 cursor-pointer font-semibold shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  Salva & Attiva {langLabel} ({langFlag})
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
