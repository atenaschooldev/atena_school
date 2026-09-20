"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { BookingPaymentStatus } from "@atena/api-types";
import { linkUserAccountWorkflow, DEFAULT_SCHOOL_PROFILE } from "@atena/core";

async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
  } catch {}

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.includes("auth-token") || c.name.includes("access-token")) {
      try {
        const parsed = JSON.parse(c.value);
        const tok = parsed.access_token || parsed[0]?.access_token || c.value;
        if (tok && typeof tok === "string") return tok;
      } catch {
        if (c.value) return c.value;
      }
    }
  }
  return null;
}

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "";
}

// ─── getDashboardDataAction ───────────────────────────────────────────────────

export async function getDashboardDataAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, user: null, bookings: [] };
  }

  // 1. Try Backend if configured
  const backendUrl = getBackendUrl();
  if (backendUrl && backendUrl !== "http://localhost:4000") {
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await fetch(`${backendUrl}/app/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) return await res.json();
      }
    } catch {
      // Fall through to autonomous Supabase SSR execution
    }
  }

  // 2. Autonomous Supabase SSR execution for Vercel Serverless
  try {
    const cleanEmail = (user.email || "").trim().toLowerCase();

    const supabaseAdmin = getSupabaseAdmin();

    // Auto-link user_id across bookings, students, memberships and payments using admin client
    if (cleanEmail) {
      try {
        await linkUserAccountWorkflow(supabaseAdmin, {
          userId: user.id,
          email: cleanEmail,
          metadata: user.user_metadata,
        });
      } catch (linkErr) {
        console.warn("Auto-link account error:", linkErr);
      }
    }

    // Query user's bookings (by user_id, student_email, purchaser_email)
    const filterConditions = [`user_id.eq.${user.id}`];
    if (cleanEmail) {
      filterConditions.push(`student_email.ilike.${cleanEmail}`);
      filterConditions.push(`purchaser_email.ilike.${cleanEmail}`);
    }

    const { data: rawBookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .or(filterConditions.join(","))
      .in("payment_status", [BookingPaymentStatus.PENDING, BookingPaymentStatus.RESERVED, BookingPaymentStatus.PAID])
      .order("created_at", { ascending: false });

    const bookingsList = rawBookings || [];
    const courseIds = Array.from(new Set(bookingsList.map((b) => b.course_id || b.item_id).filter(Boolean)));
    
    let coursesMap = new Map<string, any>();
    if (courseIds.length > 0) {
      const { data: cData } = await supabaseAdmin
        .from("courses")
        .select("id, name, price, photo_url, schedule_days, start_time, end_time, course_format, teacher_id")
        .in("id", courseIds);

      if (cData) {
        coursesMap = new Map(cData.map((c) => [c.id, c]));
      }
    }

    // Fetch teachers if needed
    const teacherIds = Array.from(new Set(Array.from(coursesMap.values()).map(c => c.teacher_id).filter(Boolean)));
    let teachersMap = new Map<string, string>();
    if (teacherIds.length > 0) {
      const { data: tData } = await supabaseAdmin
        .from("teachers")
        .select("teacher_id, full_name")
        .in("teacher_id", teacherIds);
      if (tData) {
        teachersMap = new Map(tData.map(t => [t.teacher_id, t.full_name || ""]));
      }
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const enrichedBookings = bookingsList.map((b: any) => {
      const cid = b.course_id || b.item_id;
      const c = coursesMap.get(cid);
      const title = c?.name || b.course_name || `Corso ${DEFAULT_SCHOOL_PROFILE.name}`;
      const coursePrice = c?.price ? Number(c.price) : Number(b.amount_paid || 0);
      const totalAmount = Number(b.amount_paid || coursePrice || 0);
      const teacherName = c?.teacher_id ? teachersMap.get(c.teacher_id) || DEFAULT_SCHOOL_PROFILE.name : (c?.teacher_name || `Docente ${DEFAULT_SCHOOL_PROFILE.name}`);

      const bdateStr = b.start_date || b.created_at;
      let isFuture = true;
      if (bdateStr) {
        const d = new Date(bdateStr);
        if (!isNaN(d.getTime())) {
          isFuture = d.getTime() >= now.getTime();
        }
      }

      return {
        ...b,
        item_id: cid,
        item_type: "course",
        item_title: title,
        title,
        course_name: title,
        price: totalAmount,
        amount_paid: totalAmount,
        course_price: coursePrice,
        teacher_name: teacherName,
        is_future: isFuture,
        status: b.payment_status ?? BookingPaymentStatus.RESERVED,
      };
    });

    // Get public.users DB profile
    const { data: dbProfile } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      success: true,
      user: {
        ...user,
        dbProfile: dbProfile || null,
      },
      bookings: enrichedBookings,
    };
  } catch (err: any) {
    console.error("Autonomous getDashboardDataAction error:", err);
    return { success: false, user, bookings: [], error: err.message };
  }
}

// ─── updateUserProfileAction ──────────────────────────────────────────────────

export async function updateUserProfileAction(params: { profileName: string; profilePhone: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const parts = (params.profileName || "").trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: params.profileName,
        phone: params.profilePhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── getBookingLessonsAction ──────────────────────────────────────────────────

export async function getBookingLessonsAction(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Try Backend if configured
  const backendUrl = getBackendUrl();
  if (backendUrl && backendUrl !== "http://localhost:4000") {
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await fetch(`${backendUrl}/app/bookings/${bookingId}/lessons`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) return await res.json();
      }
    } catch {
      // Fall through to autonomous Supabase SSR execution
    }
  }

  // 2. Autonomous Supabase SSR execution
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bErr || !booking) throw new Error("Prenotazione non trovata");

    let course: any = null;
    const cid = booking.course_id || booking.item_id;
    if (cid) {
      const { data: cData } = await supabaseAdmin
        .from("courses")
        .select("*, teachers(full_name)")
        .eq("id", cid)
        .maybeSingle();
      course = cData;
    }

    const { data: lessons, error: lErr } = await supabaseAdmin
      .from("lessons")
      .select("*")
      .eq("booking_id", bookingId)
      .order("starts_at", { ascending: true });

    if (lErr) throw lErr;

    const maxLessons = booking.total_lessons_count || course?.total_lessons || 10;

    return {
      success: true,
      booking,
      course,
      lessons: lessons || [],
      max_lessons: maxLessons,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Prenotazione non trovata" };
  }
}

// ─── scheduleNextLessonAction ─────────────────────────────────────────────────

export async function scheduleNextLessonAction(bookingId: string, dateStr: string, timeStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autorizzato" };

  try {
    const startsAt = new Date(`${dateStr}T${timeStr}:00`);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        booking_id: bookingId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, lesson: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Impossibile programmare la lezione" };
  }
}
