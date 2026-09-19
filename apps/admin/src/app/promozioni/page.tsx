"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { PromotionsView } from "@/features/promotions/components/promotions-view";
import { useTranslation } from "@/i18n/context";

export default function PromozioniPage() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("promotions.title")}
      description={t("promotions.subtitle")}
    >
      <PromotionsView />
    </BaseLayout>
  );
}
