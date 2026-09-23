"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { FormsListView } from "@/features/forms";
import { useTranslation } from "@/i18n/context";

export default function ModuliPage() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("forms.title")}
      description={t("forms.subtitle")}
    >
      <FormsListView />
    </BaseLayout>
  );
}

