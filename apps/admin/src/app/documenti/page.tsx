"use client";

import React from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { DocumentsView } from "@/features/documents";
import { useTranslation } from "@/i18n/context";

export default function DocumentiPage() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("documents.title") || "Documenti & Contratti"}
      description={
        t("documents.subtitle") ||
        "Gestione centralizzata di moduli di iscrizione, contratti docenti, ricevute fiscali e certificati ufficiali."
      }
    >
      <DocumentsView />
    </BaseLayout>
  );
}
