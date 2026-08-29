"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { UsersView } from "@/features/users/components/users-view";
import { useTranslation } from "@/i18n/context";

export default function UsersPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("users.title")} description={t("users.subtitle")}>
      <UsersView />
    </BaseLayout>
  );
}
