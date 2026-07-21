"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { fetchUserBookingsEnriched, updateUserProfile } from "@/features/dashboard/services/dashboardService";

export async function getDashboardDataAction() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, user: null, bookings: [] };
    }

    const bookings = await fetchUserBookingsEnriched(user, supabase);
    return {
      success: true,
      user,
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

    await updateUserProfile(user, params, supabase);
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

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return { success: false, error: "Prenotazione non trovata" };
    }

    // Fetch course metadata
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", booking.item_id)
      .single();

    // Fetch lessons
    const { data: lessons } = await supabase
      .from("booking_lessons")
      .select("*")
      .eq("booking_id", bookingId)
      .order("starts_at", { ascending: true });

    return {
      success: true,
      booking,
      course,
      lessons: lessons || []
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

function parseDurationToMinutes(durationStr: string): number {
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

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return { success: false, error: "Prenotazione non trovata" };
    }

    const { data: course, error: courseErr } = await supabase
      .from("courses")
      .select("*")
      .eq("id", booking.item_id)
      .single();

    if (courseErr || !course) {
      return { success: false, error: "Corso non trovato" };
    }

    let maxLessons = 8;
    const cName = (course.name || "").toLowerCase();
    const schedule = (course.standard_schedule || "").toLowerCase();

    if (cName.includes("10 lezioni")) {
      maxLessons = 10;
    } else if (cName.includes("singole") || course.duration?.toLowerCase().includes("1h")) {
      maxLessons = 1;
    } else if (cName.includes("c2") || schedule.includes("c2")) {
      maxLessons = 12;
    } else if (course.category === "academic" || course.category === "certipass") {
      maxLessons = 1;
    }

    const { count, error: countErr } = await supabase
      .from("booking_lessons")
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

    const durationMinutes = parseDurationToMinutes(course.duration);
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

    const { data: newLesson, error: insertErr } = await supabase
      .from("booking_lessons")
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
