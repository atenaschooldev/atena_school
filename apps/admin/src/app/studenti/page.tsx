"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { StudentsView } from "@/features/students/components/students-view";
import { useTranslation } from "@/i18n/context";

export default function StudentsPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("students.title")} description={t("students.subtitle")}>
      <StudentsView />
    </BaseLayout>
  );
}

