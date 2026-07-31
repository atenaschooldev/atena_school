"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { PaymentsView } from "@/features/payments/components/payments-view";

export default function PagamentiPage() {
  return (
    <BaseLayout title="Pagamenti" description="Gestisci i pagamenti, le tessere e il registro incassi">
      <PaymentsView />
    </BaseLayout>
  );
}
