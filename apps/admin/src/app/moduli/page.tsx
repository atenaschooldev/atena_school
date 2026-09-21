"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { FormsListView } from "@/features/forms";

export default function ModuliPage() {
  return (
    <BaseLayout
      title="Gestione Moduli & Form Engine"
      description="Crea, personalizza e collega i moduli di iscrizione e contatto per il sito web e il checkout dei corsi."
    >
      <FormsListView />
    </BaseLayout>
  );
}
