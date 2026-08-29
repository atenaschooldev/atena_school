"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { BookingsView } from "@/features/bookings/components/bookings-view";
import { useTranslation } from "@/i18n/context";

export default function PrenotazioniPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("bookings.title")} description={t("bookings.subtitle")}>
      <BookingsView />
    </BaseLayout>
  );
}
