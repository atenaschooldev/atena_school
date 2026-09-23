"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";

export interface DataTableFloatingBarProps<TData> {
  table: Table<TData>;
  children?: React.ReactNode;
}

export function DataTableFloatingBar<TData>({
  table,
  children,
}: DataTableFloatingBarProps<TData>) {
  const { t } = useTranslation();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl ring-1 ring-primary/20 text-xs">
        <div className="flex items-center gap-2 pr-2 border-r border-border/60">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            <CheckSquare className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">
            {count} {t("common.selected") || "selezionati"}
          </span>
        </div>

        {children}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.resetRowSelection()}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
        >
          <X className="h-3.5 w-3.5" />
          {t("common.clearSelection") || "Annulla"}
        </Button>
      </div>
    </div>
  );
}
