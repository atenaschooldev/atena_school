"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { OrariView } from "@/features/schedule/components/orari-view";
import { useTranslation } from "@/i18n/context";

export default function OrariPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("schedule.title")} description={t("schedule.subtitle")}>
      <OrariView />
    </BaseLayout>
  );
}
