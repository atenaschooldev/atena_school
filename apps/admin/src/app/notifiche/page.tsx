"use client";

import { BaseLayout } from "@/components/layouts/base-layout";
import { NotificationsView } from "@/features/notifications/components/notifications-view";
import { useTranslation } from "@/i18n/context";

export default function NotifichePage() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      title={t("notifications.title") || "Gestione Notifiche & Template"}
      description={
        t("notifications.subtitle") ||
        "Personalizza i modelli di notifica via Email (Resend) e Telegram inviati a clienti e amministrazione."
      }
    >
      <NotificationsView />
    </BaseLayout>
  );
}
