"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { GroupsView } from "@/features/groups";
import { useTranslation } from "@/i18n/context";

export default function GruppiPage() {
  const { t } = useTranslation();
  return (
    <BaseLayout title={t("groups.title")} description={t("groups.subtitle")}>
      <div className="px-4 lg:px-6 pt-0 pb-8">
        <GroupsView />
      </div>
    </BaseLayout>
  );
}
