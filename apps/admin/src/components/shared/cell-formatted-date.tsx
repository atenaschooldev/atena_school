"use client";

import { Calendar } from "lucide-react";

export interface CellFormattedDateProps {
  dateValue?: string | Date | null;
  className?: string;
}

export function CellFormattedDate({ dateValue, className }: CellFormattedDateProps) {
  if (!dateValue) return <span className="text-xs text-muted-foreground">—</span>;

  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return <span className="text-xs text-muted-foreground">—</span>;

  const dateStr = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = d.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 dark:bg-muted/30 border border-border/60 text-[11px] font-mono font-medium text-foreground shadow-2xs ${className || ""}`}
    >
      <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
      <span>{dateStr}</span>
      <span className="text-muted-foreground/50">•</span>
      <span className="text-primary font-semibold">{timeStr}</span>
    </div>
  );
}
