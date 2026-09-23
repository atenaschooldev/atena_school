"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableViewOptions } from "./data-table-view-options";
import { useTranslation } from "@/i18n/context";

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FilterConfig {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: FilterOption[];
  width?: string;
}

export interface DataTableToolbarProps<TData = any> {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onResetFilters?: () => void;
  table?: Table<TData>;
  actionElement?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData>({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onResetFilters,
  table,
  actionElement,
  children,
  className = "",
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
  const effectivePlaceholder = searchPlaceholder || t("common.search") || "Cerca...";

  // Check if any filter is active
  const isFiltered =
    Boolean(searchQuery) ||
    filters.some((f) => f.value && f.value !== "all" && f.value !== "");

  return (
    <div
      className={`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder={effectivePlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background/50 focus-visible:bg-background transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                title={t("common.clear") || "Cancella"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {filters.map((f, idx) => (
          <Select key={idx} value={f.value} onValueChange={f.onChange}>
            <SelectTrigger
              className={`${f.width || "w-[160px]"} h-9 text-xs font-medium cursor-pointer bg-background/50 hover:bg-accent/40 transition-colors`}
            >
              <SelectValue placeholder={f.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    {opt.icon && <opt.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {children}

        {isFiltered && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("common.resetFilters") || "Reset"}</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
        {table && <DataTableViewOptions table={table} />}
        {actionElement}
      </div>
    </div>
  );
}
