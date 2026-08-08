"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { UsersView } from "@/features/users/components/users-view";

export default function UsersPage() {
  return (
    <BaseLayout title="Utenti" description="Gestisci gli utenti и i ruoli del sistema">
      <UsersView />
    </BaseLayout>
  );
}
