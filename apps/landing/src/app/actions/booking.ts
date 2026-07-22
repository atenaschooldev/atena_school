"use server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServerClient as createSupabaseSsrClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { calculateLessonDates } from "@/lib/utils/bookingScheduler";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";

function isServiceRoleValid() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (
    serviceRoleKey &&
    !serviceRoleKey.includes("placeholder") &&
    !serviceRoleKey.includes("your-service-role-key-here")
  );
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = isServiceRoleValid()
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, key);
}

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

async function fetchItemData(adminClient: any, itemType: string, itemId: string) {
  if (!itemId) return null;

  // 1. Search in courses by id
  const { data: course } = await adminClient
    .from("courses")
    .select("*, teachers(teacher_id, full_name)")
    .eq("id", itemId)
    .maybeSingle();

  if (course) return course;

  // 2. Search in shop_items by id
  const { data: shopItem } = await adminClient
    .from("shop_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();

  if (shopItem) return shopItem;

  // 3. Search in courses by slug / name match
  const { data: byName } = await adminClient
    .from("courses")
    .select("*, teachers(teacher_id, full_name)")
    .ilike("name", `%${itemId}%`)
    .maybeSingle();

  return byName || null;
}

// 1. Get enriched booking details for receipt / success page
export async function getBookingDetailsServer(bookingId: string) {
  if (!bookingId) return null;

  try {
    const admin = getSupabaseAdmin();
    const { data: booking, error } = await admin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (error || !booking) return null;

    const cid = booking.course_id || booking.item_id;
    const item = await fetchItemData(admin, "course", cid);

    return {
      ...booking,
      item_name: item?.name || item?.title_it || item?.title || "Lezione Atena School",
      item_price: item?.price || booking?.amount_paid || booking?.price || 0,
      item_photo: item?.photo_url || null,
      item_teacher: item?.teachers?.full_name || null,
      date: booking.start_date || booking.booking_date || null,
      time: booking.booking_time || null,
    };
  } catch (err) {
    console.error("Error in getBookingDetailsServer:", err);
    return null;
  }
}

// 2. Confirm payment on success page return (calls secure Edge Function)
export async function confirmPaymentAction(bookingId: string, sessionId: string) {
  if (!bookingId || !sessionId) return { success: false, error: "Missing parameters" };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          booking_id: bookingId,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore durante la verifica del pagamento");

    return {
      success: true,
      booking: data.booking,
    };
  } catch (err: any) {
    console.error("Error in confirmPaymentAction:", err);
    return { success: false, error: err.message || "Failed to confirm payment" };
  }
}

export async function getCartCountAction(sessionId?: string | null) {
  try {
    const admin = getSupabaseAdmin();
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = admin.from("bookings").select("id", { count: "exact", head: true }).in("payment_status", ["pending_payment", "pending", "reserved"]);

    if (user) {
      query = query.eq("user_id", user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return { success: true, count: 0 };
    }

    const { count, error } = await query;
    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch {
    return { success: true, count: 0 };
  }
}

// Alias for backwards compatibility
export const verifyPaymentServerAction = confirmPaymentAction;

// 3. Initiate Stripe Checkout
export async function initiateStripePaymentAction(params: {
  type: string;
  id: string;
  dateParam: string;
  timeParam: string;
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isForChild?: boolean;
    studentFirstName?: string;
    studentLastName?: string;
    studentBirthDate?: string;
    taxCode?: string;
    includeRegistrationFee?: boolean;
    notes?: string;
  };
  sessionId?: string | null;
}) {
  try {
    const cookieStore = await cookies();
    const headersData = await headers();
    const host = headersData.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const origin = `${protocol}://${host}`;
    const guestSessionId = params.sessionId || cookieStore.get("atena_session_id")?.value || cookieStore.get("booking_session_id")?.value || null;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          itemId: params.id,
          itemType: params.type,
          customerEmail: params.values.email,
          firstName: params.values.firstName,
          lastName: params.values.lastName,
          phone: params.values.phone,
          isForChild: params.values.isForChild,
          studentFirstName: params.values.studentFirstName,
          studentLastName: params.values.studentLastName,
          studentBirthDate: params.values.studentBirthDate,
          taxCode: params.values.taxCode,
          includeRegistrationFee: params.values.includeRegistrationFee !== false,
          notes: params.values.notes || "",
          date: params.dateParam,
          time: params.timeParam,
          locale: "it",
          origin,
          userId: user?.id || null,
          guestSessionId: user ? null : guestSessionId,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore durante il pagamento");

    return { success: true, url: data.url };
  } catch (err: any) {
    console.error("Error in initiateStripePaymentAction:", err);
    return { success: false, error: err.message || "Failed to initiate Stripe payment" };
  }
}

// 4. Create Offline / Paga in Sede Reservation
export async function createOrUpdateReservationServerAction(params: {
  type: string;
  id: string;
  dateParam: string;
  timeParam: string;
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isForChild?: boolean;
    studentFirstName?: string;
    studentLastName?: string;
    studentBirthDate?: string;
    taxCode?: string;
    includeRegistrationFee?: boolean;
    notes?: string;
  };
  sessionId?: string | null;
  origin?: string;
}) {
  try {
    const { type, id: itemId, dateParam, timeParam, values, sessionId } = params;
    const admin = getSupabaseAdmin();
    const item = await fetchItemData(admin, type, itemId);
    if (!item) throw new Error("Servizio non trovato");

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const purchaserName = `${values.firstName} ${values.lastName}`.trim();
    const studentName = values.isForChild && values.studentFirstName
      ? `${values.studentFirstName} ${values.studentLastName || ""}`.trim()
      : purchaserName;

    // Check for existing pending/reserved booking
    const { data: existing } = await admin
      .from("bookings")
      .select("id")
      .eq("student_email", values.email)
      .or(`course_id.eq.${itemId},item_id.eq.${itemId}`)
      .in("payment_status", ["pending_payment", "pending", "reserved"])
      .maybeSingle();

    const isFlexible = item.schedule_type === "flexible" || !dateParam || dateParam === "da_concordare" || (!item.schedule_days || item.schedule_days.length === 0);
    const todayStr = new Date().toISOString().split("T")[0];
    const finalBookingDate = (dateParam && dateParam !== "da_concordare") ? dateParam : todayStr;
    const finalBookingTime = (timeParam && timeParam !== "da_concordare") ? timeParam : "Da concordare";
    const schedulingStatus = isFlexible ? "pending_coordination" : "scheduled";

    // Calculate lesson dates (only for fixed schedule)
    const lessons = isFlexible ? [] : calculateLessonDates(
      finalBookingDate,
      finalBookingTime,
      item.category || "",
      item.schedule_days,
      item.lesson_duration_minutes || 60,
      item.start_time,
      item.end_time,
      item.schedule_type
    );

    const totalLessons = lessons.length || item.total_lessons || 1;
    const coursePrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price || 0).replace(",", "."));
    const registrationFee = values.includeRegistrationFee !== false ? ANNUAL_REGISTRATION_FEE_EUR : 0;
    const amountPaid = coursePrice + registrationFee;

    // Compute subscription range
    const subStartsAt = lessons.length > 0 ? lessons[0].startsAt : new Date(finalBookingDate).toISOString();
    const subEndsAtDate = new Date(subStartsAt);
    subEndsAtDate.setMonth(subEndsAtDate.getMonth() + 1);
    const subEndsAt = subEndsAtDate.toISOString();

    let booking;

    if (existing) {
      const { data: updated, error } = await admin
        .from("bookings")
        .update({
          course_id: itemId,
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          start_date: finalBookingDate,
          booking_time: finalBookingTime,
          payment_status: "reserved",
          booking_status: "active",
          payment_method: "stripe",
          amount_paid: amountPaid,
          registration_fee: registrationFee,
          total_lessons_count: totalLessons,
          scheduling_status: schedulingStatus,
          purchaser_name: purchaserName,
          student_name: studentName,
          student_phone: values.phone,
          student_birth_date: values.studentBirthDate || null,
          tax_code: values.taxCode || null,
          notes: values.notes || "",
          subscription_starts_at: subStartsAt,
          subscription_ends_at: subEndsAt,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      booking = updated;
    } else {
      const { data: inserted, error } = await admin
        .from("bookings")
        .insert([{
          course_id: itemId,
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          start_date: finalBookingDate,
          booking_time: finalBookingTime,
          payment_status: "reserved",
          booking_status: "active",
          payment_method: "stripe",
          amount_paid: amountPaid,
          registration_fee: registrationFee,
          total_lessons_count: totalLessons,
          scheduling_status: schedulingStatus,
          purchaser_name: purchaserName,
          student_name: studentName,
          student_email: values.email,
          student_phone: values.phone,
          student_birth_date: values.studentBirthDate || null,
          tax_code: values.taxCode || null,
          notes: values.notes || "",
          subscription_starts_at: subStartsAt,
          subscription_ends_at: subEndsAt,
        }])
        .select()
        .single();

      if (error) throw error;
      booking = inserted;
    }

    // Sync lessons
    await admin
      .from("lessons")
      .delete()
      .eq("booking_id", booking.id);

    if (lessons.length > 0) {
      const { error: lessonsError } = await admin
        .from("lessons")
        .insert(
          lessons.map(lesson => ({
            booking_id: booking.id,
            starts_at: lesson.startsAt,
            ends_at: lesson.endsAt,
            status: "scheduled",
            teacher_id: item.teacher_id || null,
          }))
        );

      if (lessonsError) throw lessonsError;
    }

  return { success: true, booking };
} catch (err: any) {
  console.error("Error in createOrUpdateReservationServerAction:", err);
  return { success: false, error: err.message || "Failed to create reservation" };
}
}

// 5. Account & Guest Bookings Linker
export async function mergeGuestBookingsAction(sessionId: string) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const admin = getSupabaseAdmin();

    // Link by session ID
    if (sessionId) {
      await admin
        .from("bookings")
        .update({ user_id: user.id })
        .eq("session_id", sessionId);
    }

    // Link by email (only updating user_id, never status)
    if (user.email) {
      await admin
        .from("bookings")
        .update({ user_id: user.id })
        .ilike("student_email", user.email);

      const { data: latest } = await admin
        .from("bookings")
        .select("student_name, student_phone")
        .ilike("student_email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        const studentName = latest.student_name || "";
        const studentPhone = latest.student_phone || "";
        const nameParts = studentName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        await supabase.auth.updateUser({
          data: {
            phone: studentPhone || user.user_metadata?.phone,
            full_name: studentName || user.user_metadata?.full_name,
            custom_full_name: studentName || user.user_metadata?.custom_full_name,
          }
        });

        try {
          await admin
            .from("users")
            .upsert({
              id: user.id,
              email: user.email,
              phone: studentPhone || null,
              first_name: firstName || null,
              last_name: lastName || null,
              full_name: studentName || null,
              updated_at: new Date().toISOString(),
            }, { onConflict: "id" });
        } catch (uErr) {
          console.warn("Could not upsert into public.users table:", uErr);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in mergeGuestBookingsAction:", err);
    return { success: false, error: err.message };
  }
}

// 6. User Helper Action
export async function getCurrentUserAction() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { success: true, user };
  } catch {
    return { success: false, user: null };
  }
}



export async function fetchCheckoutItemAction(type: string, id: string) {
  try {
    const admin = getSupabaseAdmin();
    const item = await fetchItemData(admin, type, id);
    return { success: true, item };
  } catch (err: any) {
    return { success: false, item: null, error: err.message };
  }
}

export async function dispatchMagicLinkAction(email: string) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserPhoneAction(phone: string) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.updateUser({
      data: { phone },
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteBookingServerAction(bookingId: string, sessionId: string | null) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = getSupabaseAdmin();

    let query = admin
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (user) {
      query = query.eq("user_id", user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await query;
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Failed to run deleteBookingServerAction:", err);
    return { success: false, error: err.message || "Failed to delete" };
  }
}

export async function checkoutCartServerAction(sessionId: string | null) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = getSupabaseAdmin();

    let query = admin
      .from("bookings")
      .update({ status: "paid" })
      .in("status", ["in_cart", "pending_payment"]);

    if (user) {
      query = query.eq("user_id", user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await query;
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Failed to run checkoutCartServerAction:", err);
    return { success: false, error: err.message || "Checkout failed" };
  }
}

export async function fetchCartItemsAction(sessionId: string | null) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = getSupabaseAdmin();

    let query = admin
      .from("bookings")
      .select("*")
      .in("payment_status", ["in_cart", "pending_payment", "pending", "reserved"]);

    if (user) {
      query = query.eq("user_id", user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return { success: true, bookings: [] };
    }

    const { data: bookingsData, error: bookingsError } = await query;
    if (bookingsError) throw bookingsError;

    if (bookingsData && bookingsData.length > 0) {
      const formatted = await Promise.all(
        bookingsData.map(async (b) => {
          const cid = b.course_id || b.item_id;
          const item = await fetchItemData(admin, b.item_type || "course", cid);

          const title = item?.name || item?.title_it || item?.title || "Unknown";
          const rawPrice = item?.price || b.amount_paid || b.price || 0;
          let priceNum = 0;
          if (typeof rawPrice === "number") {
            priceNum = rawPrice;
          } else {
            const parsed = parseFloat(rawPrice.toString().replace("€", "").trim());
            if (!isNaN(parsed)) {
              priceNum = parsed;
            }
          }
          const price = `${priceNum.toFixed(2)}€`;
          const teacher = item?.teacher_name || "Staff Atena";

          return {
            ...b,
            course_id: cid,
            item_id: cid,
            booking_date: b.start_date || b.booking_date,
            start_date: b.start_date || b.booking_date,
            title,
            price,
            teacher,
          };
        })
      );
      return { success: true, bookings: formatted };
    }

    return { success: true, bookings: [] };
  } catch (err: any) {
    console.error("Failed to run fetchCartItemsAction:", err);
    return { success: false, bookings: [], error: err.message || "Failed to fetch cart items" };
  }
}

