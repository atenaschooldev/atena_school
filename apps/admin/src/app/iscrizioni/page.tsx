"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { MembershipsView } from "@/features/memberships/components/memberships-view";
import { useTranslation } from "@/i18n/context";

export default function IscrizioniPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("memberships.title")} description={t("memberships.subtitle")}>
      <MembershipsView />
    </BaseLayout>
  );
}
