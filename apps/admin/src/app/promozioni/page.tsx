"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { PromotionsView } from "@/features/promotions/components/promotions-view";

export default function PromozioniPage() {
  return (
    <BaseLayout
      title="Codici Promozionali"
      description="Gestisci coupon, sconti percentuali, sconti fissi e azzeramento quota associativa"
    >
      <PromotionsView />
    </BaseLayout>
  );
}
