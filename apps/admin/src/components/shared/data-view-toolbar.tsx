"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/context";

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
  className?: string;
}

export function DataViewToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  actionElement,
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
      </div>
    </div>
  );
}
