import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { en } from "./locales/en";
import { it } from "./locales/it";

export type BuiltinLocale = "en" | "it";
export type Locale = BuiltinLocale | (string & {});

export interface CustomLocaleEntry {
  code: string;
  label: string;
  flag: string;
  data: Record<string, any>;
  createdAt: string;
}

export interface LanguageItem {
  code: string;
  label: string;
  flag: string;
  isCustom?: boolean;
}

const BUILTIN_LANGUAGES: LanguageItem[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

const builtinTranslations: Record<BuiltinLocale, any> = {
  en,
  it,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  languages: LanguageItem[];
  customLocales: Record<string, CustomLocaleEntry>;
  importCustomLocale: (
    code: string,
    label: string,
    flag: string,
    data: any
  ) => { success: boolean; error?: string; count?: number; coveragePercent?: number };
  deleteCustomLocale: (code: string) => void;
  exportMasterDictionary: () => typeof en;
  exportDictionaryJson: (lang?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY_LOCALE = "atena_admin_locale";
const STORAGE_KEY_CUSTOM_LOCALES = "atena_admin_custom_locales";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Load custom locales from localStorage
  const [customLocales, setCustomLocales] = useState<Record<string, CustomLocaleEntry>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LOCALES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("[i18n] Failed to load custom locales from storage", e);
    }
    return {};
  });

  // Load active locale
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCALE);
      if (saved) return saved;
    } catch {}
    return "en"; // Default to English
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY_LOCALE, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Combined language list (built-in + custom)
  const languages: LanguageItem[] = useMemo(() => {
    const customList = Object.values(customLocales).map((c) => ({
      code: c.code,
      label: c.label,
      flag: c.flag || "🌐",
      isCustom: true,
    }));
    return [...BUILTIN_LANGUAGES, ...customList];
  }, [customLocales]);

  // Translation resolver with full fallback chain: custom -> builtin -> en -> key
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      let result: any = undefined;

      // 1. Check custom locale data if currently active
      if (customLocales[locale]?.data) {
        let temp: any = customLocales[locale].data;
        for (const k of keys) {
          temp = temp?.[k];
        }
        if (temp !== undefined && temp !== null && temp !== "") {
          result = temp;
        }
      }

      // 2. Check built-in translations if match
      if (result === undefined && locale in builtinTranslations) {
        let temp: any = builtinTranslations[locale as BuiltinLocale];
        for (const k of keys) {
          temp = temp?.[k];
        }
        if (temp !== undefined && temp !== null && temp !== "") {
          result = temp;
        }
      }

      // 3. Fallback to English built-in
      if (result === undefined) {
        let temp: any = builtinTranslations.en;
        for (const k of keys) {
          temp = temp?.[k];
        }
        result = temp;
      }

      let val = result ?? path;

      // Interpolate parameters {{key}} or {key}
      if (typeof val === "string" && params) {
        for (const [pk, pv] of Object.entries(params)) {
          val = val
            .replace(new RegExp(`{{${pk}}}`, "g"), String(pv))
            .replace(new RegExp(`{${pk}}`, "g"), String(pv));
        }
      }

      return typeof val === "string" ? val : path;
    },
    [locale, customLocales]
  );

  // Import and validate custom locale JSON
  const importCustomLocale = useCallback(
    (
      code: string,
      label: string,
      flag: string,
      data: any
    ): { success: boolean; error?: string; count?: number; coveragePercent?: number } => {
      try {
        const cleanCode = code.trim().toLowerCase();
        if (!cleanCode || !/^[a-z0-9_-]{2,10}$/i.test(cleanCode)) {
          return {
            success: false,
            error: "Codice lingua non valido (usa 2-5 lettere, es. pl, es, de, uk, ro)",
          };
        }

        if (cleanCode === "en" || cleanCode === "it") {
          return {
            success: false,
            error: "Non puoi sovrascrivere le lingue di sistema integrate (en, it)",
          };
        }

        if (typeof data !== "object" || data === null || Array.isArray(data)) {
          return {
            success: false,
            error: "Il file deve contenere un oggetto JSON valido con i moduli di traduzione",
          };
        }

        // Count keys and calculate coverage against master en dictionary
        let totalMasterKeys = 0;
        let matchedKeys = 0;

        for (const [modKey, modContent] of Object.entries(en)) {
          if (typeof modContent === "object" && modContent !== null) {
            for (const key of Object.keys(modContent)) {
              totalMasterKeys++;
              if (
                data[modKey] &&
                typeof data[modKey] === "object" &&
                data[modKey][key] &&
                typeof data[modKey][key] === "string" &&
                data[modKey][key].trim() !== ""
              ) {
                matchedKeys++;
              }
            }
          }
        }

        const coveragePercent =
          totalMasterKeys > 0 ? Math.round((matchedKeys / totalMasterKeys) * 100) : 100;

        const newEntry: CustomLocaleEntry = {
          code: cleanCode,
          label: label.trim() || cleanCode.toUpperCase(),
          flag: flag.trim() || "🌐",
          data,
          createdAt: new Date().toISOString(),
        };

        const updated = {
          ...customLocales,
          [cleanCode]: newEntry,
        };

        setCustomLocales(updated);
        try {
          localStorage.setItem(STORAGE_KEY_CUSTOM_LOCALES, JSON.stringify(updated));
        } catch (e) {
          console.error("[i18n] Failed to persist custom locales", e);
        }

        return {
          success: true,
          count: matchedKeys,
          coveragePercent,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || "Errore imprevisto durante l'importazione",
        };
      }
    },
    [customLocales]
  );

  // Delete custom locale
  const deleteCustomLocale = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toLowerCase();
      if (cleanCode === "en" || cleanCode === "it") return;

      const updated = { ...customLocales };
      delete updated[cleanCode];
      setCustomLocales(updated);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_LOCALES, JSON.stringify(updated));
      } catch {}

      // If active locale was deleted, switch back to English
      if (locale === cleanCode) {
        setLocale("en");
      }
    },
    [customLocales, locale, setLocale]
  );

  const exportMasterDictionary = useCallback(() => {
    return en;
  }, []);

  const exportDictionaryJson = useCallback(
    (lang?: string) => {
      const targetLang = lang || locale;
      if (targetLang === "it") {
        return JSON.stringify(it, null, 2);
      }
      if (customLocales[targetLang]?.data) {
        return JSON.stringify(customLocales[targetLang].data, null, 2);
      }
      return JSON.stringify(en, null, 2);
    },
    [locale, customLocales]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        languages,
        customLocales,
        importCustomLocale,
        deleteCustomLocale,
        exportMasterDictionary,
        exportDictionaryJson,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export const useI18n = useTranslation;
