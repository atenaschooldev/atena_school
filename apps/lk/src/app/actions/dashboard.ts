"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getAuthToken(): Promise<string | null> {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

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

function getBackendUrl(): string | null {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || null;
}

// ─── getDashboardDataAction ───────────────────────────────────────────────────

export async function getDashboardDataAction() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return { success: false, user: null, bookings: [] };

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) return res.json();
        }
      } catch (bErr) {
        console.warn("Backend getDashboardDataAction fallback:", bErr);
      }
    }

    // Fallback: direct Supabase read
    const [bookingsRes, profileRes] = await Promise.all([
      (supabase as any).from("bookings").select("*, courses(*)").eq("user_id", user.id),
      (supabase as any).from("users").select("*").eq("id", user.id).maybeSingle(),
    ]);

    const dbProfile = profileRes.data as any;
    const pData = dbProfile || {};
    const dbFullName = pData.full_name || (pData.first_name ? `${pData.first_name} ${pData.last_name || ""}`.trim() : "");

    const bookings = (bookingsRes.data || []).map((b: any) => {
      const course = b.courses || {};
      return {
        ...b,
        item_id: b.course_id || b.item_id,
        item_title: course.name || "Corso",
        course_name: course.name || "Corso",
        teacher_name: course.teacher_name || "Staff Atena",
        price: Number(course.price) || Number(b.amount_paid) || 0,
        is_future: b.start_date ? new Date(b.start_date) >= new Date() : true,
      };
    });

    return {
      success: true,
      user: {
        ...user,
        dbProfile: dbProfile || null,
        user_metadata: {
          ...user.user_metadata,
          ...(dbFullName ? { custom_full_name: dbFullName, full_name: dbFullName } : {}),
          ...(pData.phone ? { phone: pData.phone } : {}),
        },
      },
      bookings,
    };
  } catch (err: any) {
    console.error("getDashboardDataAction error:", err);
    return { success: false, user: null, bookings: [], error: err.message };
  }
}

// ─── updateUserProfileAction ──────────────────────────────────────────────────

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/profile`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(params),
          });
          if (res.ok) return res.json();
        }
      } catch (bErr) {
        console.warn("Backend updateUserProfileAction fallback:", bErr);
      }
    }

    // Fallback: direct Supabase write
    const parts = params.profileName.trim().split(" ");
    await (supabase as any).from("users").upsert({
      id: user.id,
      email: user.email,
      full_name: params.profileName,
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || "",
      phone: params.profilePhone,
      updated_at: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── getBookingLessonsAction ──────────────────────────────────────────────────

export async function getBookingLessonsAction(bookingId: string) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/bookings/${bookingId}/lessons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) return res.json();
        }
      } catch (bErr) {
        console.warn("Backend getBookingLessonsAction fallback:", bErr);
      }
    }

    // Fallback: direct Supabase read
    const { data: booking } = await (supabase as any).from("bookings").select("*").eq("id", bookingId).single();
    if (!booking) return { success: false, error: "Prenotazione non trovata" };

    const { data: lessons } = await (supabase as any)
      .from("lessons").select("*").eq("booking_id", bookingId).order("starts_at");

    return { success: true, booking, course: null, lessons: lessons || [], max_lessons: 8 };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── scheduleNextLessonAction ─────────────────────────────────────────────────

export async function scheduleNextLessonAction(bookingId: string, dateStr: string, timeStr: string) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non autorizzato" };

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/bookings/${bookingId}/schedule-lesson`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ dateStr, timeStr }),
          });
          if (res.ok) return res.json();
          const errData = await res.json();
          return { success: false, error: errData.message || "Impossibile programmare la lezione" };
        }
      } catch (bErr) {
        console.warn("Backend scheduleNextLessonAction fallback:", bErr);
      }
    }

    // Fallback: direct Supabase write
    const timeMatch = (timeStr || "").match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) return { success: false, error: "Formato orario non valido. Usa HH:MM." };

    const startHour = parseInt(timeMatch[1], 10);
    const startMin = parseInt(timeMatch[2], 10);
    const baseDate = new Date(dateStr);

    const romeStr = baseDate.toLocaleString("en-US", { timeZone: "Europe/Rome" });
    const utcStr = baseDate.toLocaleString("en-US", { timeZone: "UTC" });
    const offset = Math.round((new Date(romeStr).getTime() - new Date(utcStr).getTime()) / (1000 * 60 * 60));

    const startsAt = new Date(Date.UTC(
      baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(),
      startHour - offset, startMin, 0,
    ));
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    const { data: newLesson, error: insertErr } = await (supabase as any)
      .from("lessons")
      .insert({ booking_id: bookingId, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), status: "scheduled" })
      .select().single();

    if (insertErr) throw insertErr;
    return { success: true, lesson: newLesson };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossibile programmare la lezione" };
  }
}
