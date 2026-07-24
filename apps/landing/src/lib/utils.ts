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
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("atenas_session_id", sessionId);
  }
  return sessionId;
}

import { mergeGuestBookingsAction } from "@/app/actions/booking";

export async function mergeGuestBookings(supabase: any, userId: string) {
  const sessionId = getSessionId();
  if (!sessionId) return;
  await mergeGuestBookingsAction(sessionId);
}
