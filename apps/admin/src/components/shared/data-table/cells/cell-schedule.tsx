"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CellScheduleProps {
  primary: string;
  secondary?: string;
  className?: string;
}

export function CellSchedule({
  primary,
  secondary,
  className,
}: CellScheduleProps) {
  return (
    <div className={cn("flex items-start gap-2 text-xs", className)}>
      <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium text-foreground truncate">{primary}</span>
        {secondary && secondary !== primary && (
          <span className="text-[11px] text-muted-foreground truncate">{secondary}</span>
        )}
      </div>
    </div>
  );
}
