"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CellAvatarProps {
  title: string;
  subtitle?: React.ReactNode;
  imageUrl?: string | null;
  fallbackText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  extra?: React.ReactNode;
  className?: string;
}

export function CellAvatar({
  title,
  subtitle,
  imageUrl,
  fallbackText,
  icon: Icon,
  extra,
  className,
}: CellAvatarProps) {
  const fallback =
    fallbackText || (title ? title.trim().slice(0, 2).toUpperCase() : "—");

  return (
    <div className={cn("flex items-center gap-3 min-w-[200px]", className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-9 w-9 rounded-xl object-cover shrink-0 border border-border/60 shadow-2xs"
        />
      ) : Icon ? (
        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
          <Icon className="h-4 w-4" />
        </div>
      ) : (
        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 shadow-2xs uppercase">
          {fallback}
        </div>
      )}

      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-sm text-foreground truncate">{title}</span>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
        )}
        {extra}
      </div>
    </div>
  );
}
