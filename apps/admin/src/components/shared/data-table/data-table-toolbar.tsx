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
  // Search
  searchQuery?: string;
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  searchKey?: string;

  // Multiple Filters
  filters?: FilterConfig[];

  // Shorthand Single Filter
  filterKey?: string;
  filterTitle?: string;
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterOptions?: FilterOption[];

  // Actions & Controls
  onResetFilters?: () => void;
  table?: Table<TData>;
  actionElement?: React.ReactNode;
  actionButton?: React.ReactNode;
  showViewOptions?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar<TData>({
  searchQuery,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchKey,
  filters = [],
  filterKey,
  filterTitle,
  filterValue,
  onFilterChange,
  filterOptions,
  onResetFilters,
  table,
  actionElement,
  actionButton,
  showViewOptions = true,
  children,
  className = "",
}: DataTableToolbarProps<TData>) {
  const { t, locale } = useTranslation();

  // Normalize search value & handler
  const currentSearchValue =
    searchValue !== undefined
      ? searchValue
      : searchQuery !== undefined
      ? searchQuery
      : (searchKey && table ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? "" : "");

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else if (searchKey && table) {
      table.getColumn(searchKey)?.setFilterValue(val);
    }
  };

  const effectivePlaceholder =
    searchPlaceholder || t("common.search") || (locale === "en" ? "Search..." : "Cerca...");

  // Combine multiple filters + shorthand single filter
  const allFilters: FilterConfig[] = React.useMemo(() => {
    const list = [...filters];
    if (filterValue !== undefined && onFilterChange && filterOptions && filterOptions.length > 0) {
      list.push({
        value: filterValue,
        onChange: onFilterChange,
        placeholder: filterTitle || t("common.status") || (locale === "en" ? "Filter" : "Filtra"),
        options: filterOptions,
      });
    }
    return list;
  }, [filters, filterValue, onFilterChange, filterTitle, filterOptions, t, locale]);

  // Check if any filter is active
  const isFiltered =
    Boolean(currentSearchValue) ||
    allFilters.some((f) => f.value && f.value !== "all" && f.value !== "");

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      if (onSearchChange) onSearchChange("");
      if (searchKey && table) table.getColumn(searchKey)?.setFilterValue("");
      if (onFilterChange) onFilterChange("all");
      allFilters.forEach((f) => f.onChange("all"));
      if (table) table.resetColumnFilters();
    }
  };

  const actionNode = actionButton || actionElement;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {(onSearchChange || (searchKey && table)) && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder={effectivePlaceholder}
              value={currentSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-8 h-8 text-xs bg-background/60 border-border/60 focus-visible:bg-background rounded-lg transition-colors"
            />
            {currentSearchValue && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm"
                title={t("common.clear") || "Cancella"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {allFilters.map((f, idx) => (
          <Select key={idx} value={f.value} onValueChange={f.onChange}>
            <SelectTrigger
              className={`${f.width || "w-[150px] sm:w-[170px]"} h-8 text-xs font-medium cursor-pointer bg-background/60 border-border/60 hover:bg-accent/40 rounded-lg transition-colors`}
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

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 font-medium rounded-lg hover:bg-muted/80"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("common.resetFilters") || "Reset"}</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        {table && showViewOptions && <DataTableViewOptions table={table} />}
        {actionNode}
      </div>
    </div>
  );
}
