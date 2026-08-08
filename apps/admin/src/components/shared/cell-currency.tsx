"use client";

import { formatCurrency } from "@atena/utils";

export interface CellCurrencyProps {
  amount?: number | null;
  className?: string;
}

export function CellCurrency({ amount = 0, className }: CellCurrencyProps) {
  return (
    <span className={`font-bold text-sm text-foreground font-mono ${className || ""}`}>
      {formatCurrency(Number(amount || 0))}
    </span>
  );
}
