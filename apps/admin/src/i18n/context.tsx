import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en } from "./locales/en";
import { it } from "./locales/it";

export type Locale = "en" | "it";

type Translations = typeof en;

const translations: Record<Locale, any> = {
  en,
  it,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "atena_admin_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "it") return saved;
    } catch {}
    return "en"; // Default to English as requested
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      let result: any = translations[locale];
      let fallback: any = translations.en;

      for (const k of keys) {
        result = result?.[k];
        fallback = fallback?.[k];
      }

      let val = result ?? fallback ?? path;

      if (typeof val === "string" && params) {
        for (const [pk, pv] of Object.entries(params)) {
          val = val.replace(new RegExp(`{{${pk}}}`, "g"), String(pv));
        }
      }

      return typeof val === "string" ? val : path;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
