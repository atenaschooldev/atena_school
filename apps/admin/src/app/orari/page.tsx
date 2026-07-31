"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { OrariView } from "@/features/schedule/components/orari-view";

export default function OrariPage() {
  return (
    <BaseLayout title="Orari" description="Gestione orari e lezioni">
      <OrariView />
    </BaseLayout>
  );
}
