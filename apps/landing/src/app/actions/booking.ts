"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getBookingDetailsServer(bookingId: string) {
  if (!bookingId) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase URL or Service Role Key in environment variables.");
      return null;
    }

    // Bypass RLS on server-side safely
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("Error fetching booking details by admin client:", bookingError);
      return null;
    }

    // Fetch the linked course/shop item info
    let itemData: any = null;
    if (booking.item_type === "course") {
      const { data } = await supabaseAdmin
        .from("courses")
        .select("name, price, photo_url, teacher_name")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data;
    } else if (booking.item_type === "shop") {
      const { data } = await supabaseAdmin
        .from("shop_items")
        .select("title_it, price, photo_url")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data ? { name: data.title_it, price: data.price, photo_url: data.photo_url } : null;
    }

    return {
      ...booking,
      item_name: itemData?.name || null,
      item_price: itemData?.price || null,
      item_photo: itemData?.photo_url || null,
      item_teacher: itemData?.teacher_name || null,
    };
  } catch (err) {
    console.error("Failed to run getBookingDetailsServer server action:", err);
    return null;
  }
}

export async function deleteBookingServerAction(bookingId: string, sessionId: string | null) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: "Missing configuration" };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify ownership on server-side before deleting
    let query = supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (user) {
      // Logged in user can delete their own booking
      query = query.eq("user_id", user.id);
    } else if (sessionId) {
      // Guest can delete their own booking matching the session_id
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: "Missing configuration" };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    let query = supabaseAdmin
      .from("bookings")
      .update({ status: "paid" })
      .eq("status", "in_cart");

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

export async function createOrUpdateReservationServerAction(params: {
  type: string;
  id: string;
  dateParam: string;
  timeParam: string;
  slotIdParam?: string | null;
  values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  sessionId?: string | null;
  origin?: string;
}) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: "Missing configuration" };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { type, id, dateParam, timeParam, slotIdParam, values, sessionId, origin } = params;

    // Check for existing pending/reserved booking to prevent duplicate rows
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("student_email", values.email)
      .eq("item_id", id)
      .in("status", ["pending_payment", "reserved"])
      .maybeSingle();

    let booking;
    if (existingBooking) {
      const { data: updatedBooking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .update({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          booking_date: dateParam,
          booking_time: timeParam,
          slot_id: slotIdParam || null,
          status: "reserved",
          student_name: `${values.firstName} ${values.lastName}`,
          student_phone: values.phone,
          notes: values.notes || "",
          locale: "it",
        })
        .eq("id", existingBooking.id)
        .select()
        .single();

      if (bookingError) throw bookingError;
      booking = updatedBooking;
    } else {
      const { data: insertedBooking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert([{
          item_id: id,
          item_type: type,
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          booking_date: dateParam,
          booking_time: timeParam,
          slot_id: slotIdParam || null,
          status: "reserved",
          student_name: `${values.firstName} ${values.lastName}`,
          student_email: values.email,
          student_phone: values.phone,
          notes: values.notes || "",
          locale: "it",
        }])
        .select()
        .single();

      if (bookingError) throw bookingError;
      booking = insertedBooking;
    }

    // Send Magic Link for guest silent account creation ONLY if non-Gmail email
    const isGmail = values.email.toLowerCase().endsWith("@gmail.com");
    if (!user && !isGmail) {
      try {
        const redirectUrl = origin 
          ? `${origin}/auth/callback?next=/dashboard` 
          : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`;

        await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: `${values.firstName} ${values.lastName}`,
              phone: values.phone,
            },
          },
        });
      } catch (authErr) {
        console.error("Silent OTP registration failed (non-critical):", authErr);
      }
    }

    return { success: true, booking };
  } catch (err: any) {
    console.error("Failed to run createOrUpdateReservationServerAction:", err);
    return { success: false, error: err.message || "Failed to reserve" };
  }
}

