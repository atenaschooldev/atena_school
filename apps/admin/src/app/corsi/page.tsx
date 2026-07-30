"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { CorsiView } from "@/features/courses/components/corsi-view";

export default function CorsiPage() {
  return (
    <BaseLayout title="Corsi" description="Gestisci l'offerta formativa e i prezzi della scuola">
      <CorsiView />
    </BaseLayout>
  );
}
