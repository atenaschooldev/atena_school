import { format, parseISO, isFuture } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Format currency amount to EUR (e.g. €152.00)
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "€0.00";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format ISO date string into readable Italian date (e.g. 29 luglio 2026)
 */
export function formatDateItalian(dateString?: string): string {
  if (!dateString) return "";
  try {
    const dateObj = dateString.includes("T") ? parseISO(dateString) : new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString;
    return format(dateObj, "d MMMM yyyy", { locale: it });
  } catch {
    return dateString;
  }
}

/**
 * Safely parse date and check if it is in the future
 */
export function isFutureDate(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const d = dateString.includes("T") ? parseISO(dateString) : new Date(dateString);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d.getTime() >= now.getTime();
  } catch {
    return false;
  }
}

export * from "./bookingScheduler";
