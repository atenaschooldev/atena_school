import * as React from "react";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PillSelectOption {
  value: string;
  label: string;
  activeClass?: string;
  inactiveClass?: string;
  dotColor?: string;
}

export interface PillSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: PillSelectOption[];
  trigger: React.ReactNode;
  align?: "start" | "end" | "center";
  minWidth?: string;
}

export function PillSelect({
  value,
  onChange,
  options,
  trigger,
  align = "start",
  minWidth = "130px",
}: PillSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        style={{ minWidth }}
        className="p-1.5 flex flex-col gap-1 rounded-xl shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <DropdownMenuItem
              key={opt.value}
              className={`rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs cursor-pointer select-none outline-none transition-all duration-150
                ${
                  isSelected
                    ? opt.activeClass ||
                      "bg-primary hover:bg-primary/90 focus:bg-primary text-white font-semibold"
                    : opt.inactiveClass ||
                      "bg-muted/40 hover:bg-muted/70 focus:bg-muted/70 text-muted-foreground hover:text-foreground focus:text-foreground font-medium"
                }
                ${isSelected ? "hover:scale-[1.02] focus:scale-[1.02] hover:brightness-105 focus:brightness-105 hover:shadow-md focus:shadow-md active:scale-95" : "hover:scale-[1.02] focus:scale-[1.02] hover:shadow-sm focus:shadow-sm active:scale-95"}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt.value);
              }}
            >
              <div className="flex items-center gap-2">
                {opt.dotColor && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : opt.dotColor}`}
                  />
                )}
                <span>{opt.label}</span>
              </div>
              {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[2.5]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
