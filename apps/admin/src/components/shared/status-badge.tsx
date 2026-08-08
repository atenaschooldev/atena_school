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

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

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
          {normalized === "attivo" || normalized === "active" ? "Attivo" : "Pagato"}
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
          {normalized === "in-programmazione" ? "In Programmazione" : "Parziale"}
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
          {normalized === "expired" ? "Scaduta" : "In Debito"}
        </Badge>
      );

    case "revoked":
    case "concluso":
    case "archiviato":
      return (
        <Badge
          variant="secondary"
          className={`text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/40 font-semibold gap-1.5 border border-slate-500/30 shadow-2xs ${className || ""}`}
        >
          <Ban className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {normalized === "revoked" ? "Revocata" : normalized === "concluso" ? "Concluso" : "Archiviato"}
        </Badge>
      );

    case "pending_coordination":
    case "pending":
      return (
        <Badge
          variant="secondary"
          className={`text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 font-semibold gap-1.5 border border-indigo-500/30 shadow-2xs ${className || ""}`}
        >
          <CircleDashed className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          In Attesa
        </Badge>
      );

    case "reserved":
    default:
      return (
        <Badge
          variant="secondary"
          className={`text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20 font-semibold gap-1.5 border border-sky-500/30 shadow-2xs ${className || ""}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          Da Saldare
        </Badge>
      );
  }
}
