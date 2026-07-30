"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { BookingsView } from "@/features/bookings/components/bookings-view";

export default function PrenotazioniPage() {
  return (
    <BaseLayout title="Prenotazioni & Ordini" description="Gestisci le iscrizioni degli studenti e gli ordini">
      <BookingsView />
    </BaseLayout>
  );
}
