"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getAuthToken(): Promise<string | null> {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  // Fallback: extract from cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find((c) => c.name.includes("auth-token") || c.name.includes("access-token"));
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie.value);
      return parsed.access_token || parsed[0] || null;
    } catch {
      return authCookie.value;
    }
  }
  return null;
}

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
}

export async function getDashboardDataAction() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { success: false, user: null, bookings: [] };
    }

    const token = await getAuthToken();
    if (!token) return { success: false, user: null, bookings: [] };

    const res = await fetch(`${getBackendUrl()}/api/v1/portal/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) return res.json();
    return { success: false, user: null, bookings: [], error: "Backend unavailable" };
  } catch (err: any) {
    console.error("getDashboardDataAction error:", err);
    return { success: false, user: null, bookings: [], error: err.message };
  }
}

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${getBackendUrl()}/api/v1/portal/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(params),
    });

    if (res.ok) return res.json();
    return { success: false, error: "Failed to update profile" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getBookingLessonsAction(bookingId: string) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${getBackendUrl()}/api/v1/portal/bookings/${bookingId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) return res.json();
    return { success: false, error: "Failed to load lessons" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function scheduleNextLessonAction(bookingId: string, dateStr: string, timeStr: string) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Non autorizzato" };

    const res = await fetch(`${getBackendUrl()}/api/v1/portal/bookings/${bookingId}/schedule-lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dateStr, timeStr }),
    });

    if (res.ok) return res.json();
    const errData = await res.json();
    return { success: false, error: errData.message || "Impossibile programmare la lezione" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
