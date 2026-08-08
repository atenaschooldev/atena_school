"use client";

import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Building2, HelpCircle } from "lucide-react";

export interface PaymentMethodBadgeProps {
  method?: string | null;
  className?: string;
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  const normalized = (method || "").toLowerCase().trim();

  switch (normalized) {
    case "pos":
    case "card":
    case "stripe":
      return (
        <Badge
          variant="outline"
          className={`text-sky-600 border-sky-500/30 bg-sky-50/50 dark:text-sky-400 dark:bg-sky-950/20 font-medium gap-1 text-xs ${className || ""}`}
        >
          <CreditCard className="w-3 h-3 text-sky-500 shrink-0" />
          <span>{normalized === "stripe" ? "Stripe Online" : "Carta / POS"}</span>
        </Badge>
      );

    case "cash":
    case "contanti":
      return (
        <Badge
          variant="outline"
          className={`text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-950/20 font-medium gap-1 text-xs ${className || ""}`}
        >
          <Banknote className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>Contanti</span>
        </Badge>
      );

    case "bank_transfer":
    case "bonifico":
      return (
        <Badge
          variant="outline"
          className={`text-purple-600 border-purple-500/30 bg-purple-50/50 dark:text-purple-400 dark:bg-purple-950/20 font-medium gap-1 text-xs ${className || ""}`}
        >
          <Building2 className="w-3 h-3 text-purple-500 shrink-0" />
          <span>Bonifico</span>
        </Badge>
      );

    default:
      return (
        <Badge
          variant="outline"
          className={`text-muted-foreground border-border bg-muted/30 font-medium gap-1 text-xs ${className || ""}`}
        >
          <HelpCircle className="w-3 h-3 text-muted-foreground shrink-0" />
          <span>{method || "Non spec."}</span>
        </Badge>
      );
  }
}
