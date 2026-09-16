import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getSessionId() {
  if (typeof window === "undefined") return null;
  
  let sessionId = localStorage.getItem("atenas_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("atenas_session_id", sessionId);
  }
  return sessionId;
}

export async function mergeGuestBookings(_supabase: any, _userId: string) {
  // Guest bookings are linked via email/tax_code during checkout flow
  return;
}
