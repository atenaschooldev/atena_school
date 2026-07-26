"use server";

import { cookies } from "next/headers";

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  let token = "";
  for (const c of allCookies) {
    if (c.name.includes("auth-token") || c.name.includes("access-token")) {
      try {
        const parsed = JSON.parse(c.value);
        token = parsed.access_token || parsed[0]?.access_token || c.value;
        if (token) return token;
      } catch {
        return c.value;
      }
    }
  }
  return null;
}

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";
}

// ─── getDashboardDataAction ───────────────────────────────────────────────────

export async function getDashboardDataAction() {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, user: null, bookings: [] };

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/v1/portal/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) return res.json();
    const errData = await res.json().catch(() => ({}));
    return { success: false, user: null, bookings: [], error: errData.message || "Ошибка получения дашборда" };
  } catch (err: any) {
    console.error("getDashboardDataAction error:", err);
    return { success: false, user: null, bookings: [], error: err.message };
  }
}

// ─── updateUserProfileAction ──────────────────────────────────────────────────

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Unauthorized" };

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/v1/portal/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(params),
    });

    if (res.ok) return res.json();
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.message || "Impossibile aggiornare il profilo" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── getBookingLessonsAction ──────────────────────────────────────────────────

export async function getBookingLessonsAction(bookingId: string) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Unauthorized" };

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/v1/portal/bookings/${bookingId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) return res.json();
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.message || "Prenotazione non trovata" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── scheduleNextLessonAction ─────────────────────────────────────────────────

export async function scheduleNextLessonAction(bookingId: string, dateStr: string, timeStr: string) {
  try {
    const token = await getAuthToken();
    if (!token) return { success: false, error: "Non autorizzato" };

    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/v1/portal/bookings/${bookingId}/schedule-lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ dateStr, timeStr }),
    });

    if (res.ok) return res.json();
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.message || "Impossibile programmare la lezione" };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossibile programmare la lezione" };
  }
}
