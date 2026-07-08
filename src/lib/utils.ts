import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateSafe(
  dateVal: string | Date | undefined | null,
  formatStr: string = "dd.MM.yyyy",
  options?: Parameters<typeof format>[2]
): string {
  if (!dateVal) return "";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return String(dateVal);
    return format(d, formatStr, options);
  } catch {
    return String(dateVal);
  }
}

