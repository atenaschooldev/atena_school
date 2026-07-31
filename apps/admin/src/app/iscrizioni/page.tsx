"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { MembershipsView } from "@/features/memberships/components/memberships-view";

export default function IscrizioniPage() {
  return (
    <BaseLayout title="Iscrizioni" description="Gestione quote di iscrizione annuale per anno accademico">
      <MembershipsView />
    </BaseLayout>
  );
}
