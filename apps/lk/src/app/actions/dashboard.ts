"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { fetchUserBookingsEnriched, updateUserProfile } from "@/features/dashboard/services/dashboardService";
import type { EnrichedBooking } from "@repo/api";
import { getDynamicMaxLessons } from "@/lib/utils/bookingScheduler";

export async function getDashboardDataAction() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return { success: false, user: null, bookings: [] };
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let token = session?.access_token;

        if (!token) {
          const cookieStore = await cookies();
          const allCookies = cookieStore.getAll();
          const authCookie = allCookies.find((c) => c.name.includes("auth-token") || c.name.includes("access-token"));
          if (authCookie) {
            try {
              const parsed = JSON.parse(authCookie.value);
              token = parsed.access_token || parsed[0];
            } catch {
              token = authCookie.value;
            }
          }
        }

        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const bData = await res.json();
            return bData;
          }
        }
      } catch (bErr) {
        console.warn("Backend me/dashboard fallback to local fetch:", bErr);
      }
    }

    let bookings: EnrichedBooking[] = [];
    try {
      bookings = await fetchUserBookingsEnriched(user, supabase as any);
    } catch (bErr) {
      console.warn("Could not fetch user bookings:", bErr);
    }

    let dbProfile: any = null;
    try {
      const { data } = await (supabase
        .from("users") as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      dbProfile = data;
    } catch (uErr) {
      console.warn("Could not fetch user dbProfile:", uErr);
    }

    const pData = dbProfile as any;
    const dbFullName = (pData?.full_name || (pData?.first_name ? `${pData.first_name} ${pData.last_name || ""}`.trim() : "")) || undefined;

    return {
      success: true,
      user: {
        ...user,
        dbProfile: dbProfile || null,
        user_metadata: {
          ...user.user_metadata,
          ...(dbFullName ? { custom_full_name: dbFullName, full_name: dbFullName } : {}),
          ...(pData?.phone ? { phone: pData.phone } : {})
        }
      },
      bookings
    };
  } catch (err: any) {
    console.error("Failed to run getDashboardDataAction:", err);
    return { success: false, user: null, bookings: [], error: err.message || "Failed to load dashboard data" };
  }
}

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/profile`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(params),
          });
          if (res.ok) {
            const bData = await res.json();
            return bData;
          }
        }
      } catch (bErr) {
        console.warn("Backend profile update fallback:", bErr);
      }
    }

    await updateUserProfile(user, params, supabase as any);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to run updateUserProfileAction:", err);
    return { success: false, error: err.message || "Failed to update profile" };
  }
}

export async function getBookingLessonsAction(bookingId: string) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          const res = await fetch(`${backendUrl}/api/v1/portal/bookings/${bookingId}/lessons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const bData = await res.json();
            return bData;
          }
        }
      } catch (bErr) {
        console.warn("Backend booking lessons fallback:", bErr);
      }
    }

    const { data: bookingData, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !bookingData) {
      return { success: false, error: "Prenotazione non trovata" };
    }

    return {
      success: true,
      booking: bookingData,
      lessons: []
    };
  } catch (err: any) {
    console.error("Failed to run getBookingLessonsAction:", err);
    return { success: false, error: err.message || "Failed to load lessons" };
  }
}

function getRomeOffsetHours(date: Date): number {
  const romeString = date.toLocaleString("en-US", { timeZone: "Europe/Rome" });
  const utcString = date.toLocaleString("en-US", { timeZone: "UTC" });
  
  const romeDate = new Date(romeString);
  const utcDate = new Date(utcString);
  
  return Math.round((romeDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
}

function parseDurationToMinutes(durationStr?: string | number | null): number {
  if (typeof durationStr === "number") return durationStr;
  if (!durationStr) return 60;
  const lower = durationStr.toLowerCase();
  if (lower.includes("10h")) return 60;
  
  const matchOre = lower.match(/(\d+(?:\.\d+)?)\s*or/);
  if (matchOre) {
    return Math.round(parseFloat(matchOre[1]) * 60);
  }
  
  const matchMin = lower.match(/(\d+)\s*min/);
  if (matchMin) {
    return parseInt(matchMin[1], 10);
  }
  
  return 60;
}

export async function scheduleNextLessonAction(bookingId: string, dateStr: string, timeStr: string) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non autorizzato" };

    const { data: bookingData, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !bookingData) {
      return { success: false, error: "Prenotazione non trovata" };
    }

    const booking = bookingData as any;
    const cid = booking.course_id || booking.item_id;
    const { data: courseData, error: courseErr } = await supabase
      .from("courses")
      .select("*, teachers(teacher_id, full_name)")
      .eq("id", cid)
      .single();

    if (courseErr || !courseData) {
      return { success: false, error: "Corso non trovato" };
    }

    const course = courseData as any;
    const bdate = booking.start_date || booking.booking_date;
    const maxLessons = getDynamicMaxLessons(
      course.name || "",
      bdate,
      course.category || "",
      course.lessons_per_week
    );

    const { count, error: countErr } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("booking_id", bookingId);

    if (countErr) throw countErr;

    const currentCount = count || 0;
    if (currentCount >= maxLessons) {
      return {
        success: false,
        error: `Hai già programmato tutte le lezioni disponibili per questo corso (${maxLessons}/${maxLessons}).`
      };
    }

    const timeMatch = (timeStr || "").match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) return { success: false, error: "Formato orario non valido. Usa HH:MM." };
    const startHour = parseInt(timeMatch[1], 10);
    const startMin = parseInt(timeMatch[2], 10);

    const baseDate = new Date(dateStr);
    const startsAt = new Date(baseDate);
    startsAt.setUTCHours(12, 0, 0, 0);
    const offset = getRomeOffsetHours(startsAt);

    startsAt.setUTCHours(startHour - offset, startMin, 0, 0);

    const durationMinutes = parseDurationToMinutes(course.lesson_duration_minutes || course.duration);
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

    const { data: newLesson, error: insertErr } = await (supabase.from("lessons") as any)
      .insert({
        booking_id: bookingId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "scheduled"
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return { success: true, lesson: newLesson };
  } catch (err: any) {
    console.error("Error in scheduleNextLessonAction:", err);
    return { success: false, error: err.message || "Impossibile programmare la lezione" };
  }
}
