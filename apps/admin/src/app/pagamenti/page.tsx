"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { PaymentsView } from "@/features/payments/components/payments-view";
import { useTranslation } from "@/i18n/context";

export default function PagamentiPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("payments.title")} description={t("payments.subtitle")}>
      <PaymentsView />
    </BaseLayout>
  );
}
