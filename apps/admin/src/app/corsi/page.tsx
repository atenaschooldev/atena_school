"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { CorsiView } from "@/features/courses/components/corsi-view";
import { useTranslation } from "@/i18n/context";

export default function CorsiPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("courses.title")} description={t("courses.subtitle")}>
      <CorsiView />
    </BaseLayout>
  );
}
