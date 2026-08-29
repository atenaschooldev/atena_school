"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { AttendanceView } from "@/features/attendance/components/attendance-view";
import { useTranslation } from "@/i18n/context";

export default function PresenzePage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("attendance.title")} description={t("attendance.subtitle")}>
      <AttendanceView />
    </BaseLayout>
  );
}
