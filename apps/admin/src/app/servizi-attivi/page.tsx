"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { ActiveServicesView } from "@/features/active-services/components/active-services-view";
import { useTranslation } from "@/i18n/context";

export default function ServiziAttiviPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout
      title={t("activeServices.title") || "Servizi Attivi & Iscrizioni"}
      description={t("activeServices.subtitle") || "Monitoraggio in tempo reale dei corsi acquistati, abbonamenti e progresso lezioni"}
    >
      <ActiveServicesView />
    </BaseLayout>
  );
}
