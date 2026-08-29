"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { TeachersView } from "@/features/teachers/components/teachers-view";
import { useTranslation } from "@/i18n/context";

export default function InsegnantiPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("teachers.title")} description={t("teachers.subtitle")}>
      <TeachersView />
    </BaseLayout>
  );
}
