"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { LanguageManagerCard } from "@/components/shared/language-manager-card";
import { useTranslation } from "@/i18n/context";

export default function LocalizationSettings() {
  const { t } = useTranslation();

  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold">Lingue & Localizzazione AI</h1>
          <p className="text-muted-foreground">
            Gestisci le lingue della scuola, esporta il dizionario master in formato JSON, o importa traduzioni generate con intelligenza artificiale (ChatGPT, Claude, Gemini).
          </p>
        </div>

        <LanguageManagerCard />
      </div>
    </BaseLayout>
  );
}
