"use client";

import { Search, List, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: FilterOption[];
  width?: string;
}

export interface DataViewToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  actionElement?: React.ReactNode;
  viewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  className?: string;
}

import { useTranslation } from "@/i18n/context";

export function DataViewToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  actionElement,
  viewMode,
  onViewModeChange,
  className,
}: DataViewToolbarProps) {
  const { t } = useTranslation();
  const effectivePlaceholder = searchPlaceholder || t("common.search");
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className || ""}`}>
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={effectivePlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {filters.map((f, idx) => (
          <Select key={idx} value={f.value} onValueChange={f.onChange}>
            <SelectTrigger className={`${f.width || "w-[180px]"} cursor-pointer`}>
              <SelectValue placeholder={f.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        {actionElement}

        {onViewModeChange && viewMode && (
          <div className="flex items-center rounded-lg border bg-background p-1">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="h-8 px-2.5 cursor-pointer"
            >
              <List className="h-4 w-4 mr-1" />
              <span>Tabella</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8 px-2.5 cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              <span>Griglia</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
