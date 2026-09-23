"use client";

import { Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";

export interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  actionElement?: React.ReactNode;
}

export function DataTableEmptyState({
  title,
  description,
  onResetFilters,
  icon: Icon = Inbox,
  actionElement,
}: DataTableEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3 border border-border/40">
        <Icon className="h-6 w-6 opacity-70" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">
        {title || t("common.noResults") || "Nessun risultato trovato"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4">
        {description ||
          t("common.noResultsDesc") ||
          "Nessun elemento corrisponde ai criteri di ricerca o ai filtri applicati."}
      </p>

      <div className="flex items-center gap-2">
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            {t("common.resetFilters") || "Reimposta filtri"}
          </Button>
        )}
        {actionElement}
      </div>
    </div>
  );
}
