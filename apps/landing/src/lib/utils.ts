import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export async function mergeGuestBookings(supabase: any, userId: string) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  // Search for any bookings with this session_id and update them with the user_id
  const { error } = await supabase
    .from("bookings")
    .update({ 
      user_id: userId,
      session_id: null // Clear session_id once it's linked to a real user
    })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error merging guest bookings:", error);
  } else {
    // Optionally clear from localStorage after successful merge
    // localStorage.removeItem("atenas_session_id"); 
    // Wait, keeping it might be safer if they log out and log in again, 
    // but better to clear it to avoid accidental secondary merges.
  }
}
