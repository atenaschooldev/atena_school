"use client"

import { BaseLayout } from "@/components/layouts/base-layout";
import { TeachersView } from "@/features/teachers/components/teachers-view";

export default function InsegnantiPage() {
  return (
    <BaseLayout title="Docenti" description="Gestione corpo docente e assegnazione lezioni">
      <TeachersView />
    </BaseLayout>
  );
}
