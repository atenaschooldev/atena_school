"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Ban,
  CircleDashed,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { BookingPaymentStatus, BOOKING_PAYMENT_STATUS_ID_TO_STRING } from "@atena/api-types";

export interface StatusBadgeProps {
  status: string | number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const num = typeof status === "number" ? status : (!isNaN(Number(status)) && String(status).trim() !== "" ? Number(status) : null);
  const normalized = (num !== null && num in BOOKING_PAYMENT_STATUS_ID_TO_STRING
    ? BOOKING_PAYMENT_STATUS_ID_TO_STRING[num as BookingPaymentStatus]
    : String(status || "")
  ).toLowerCase().trim();

  switch (normalized) {
    case "completed":
    case "paid":
    case "succeeded":
    case "attivo":
    case "active":
      return (
        <Badge
          variant="secondary"
          className={`text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 font-semibold gap-1.5 border border-emerald-500/30 shadow-2xs ${className || ""}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          {normalized === "attivo" || normalized === "active" ? t("common.active") : t("common.paid")}
        </Badge>
      );

    case "partially_paid":
    case "in-programmazione":
      return (
        <Badge
          variant="secondary"
          className={`text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 font-semibold gap-1.5 border border-amber-500/30 shadow-2xs ${className || ""}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {normalized === "in-programmazione" ? t("common.pending") : t("common.pending")}
        </Badge>
      );

    case "overdue":
    case "scaduto":
    case "in_debt":
    case "expired":
      return (
        <Badge
          variant="secondary"
          className={`text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 font-semibold gap-1.5 border border-rose-500/30 shadow-2xs ${className || ""}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          {normalized === "expired" || normalized === "scaduto" ? t("memberships.membershipExpired") : t("common.failed")}
        </Badge>
      );

    case "reserved":
    case "prenotato":
      return (
        <Badge
          variant="secondary"
          className={`text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 font-semibold gap-1.5 border border-blue-500/30 shadow-2xs ${className || ""}`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          {t("common.reserved")}
        </Badge>
      );

    case "cancelled":
    case "annullato":
      return (
        <Badge
          variant="secondary"
          className={`text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800 font-semibold gap-1.5 border border-slate-300 shadow-2xs ${className || ""}`}
        >
          <Ban className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {t("common.cancelled")}
        </Badge>
      );

    case "pending":
    case "in-attesa":
    default:
      return (
        <Badge
          variant="outline"
          className={`text-muted-foreground border-border bg-muted/30 font-medium gap-1 text-xs ${className || ""}`}
        >
          <CircleDashed className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{status ? t(`common.${status}`) || status : t("common.pending")}</span>
        </Badge>
      );
  }
}
