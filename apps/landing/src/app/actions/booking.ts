"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServerClient as createSupabaseSsrClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

function isServiceRoleValid() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceRoleKey && 
         !serviceRoleKey.includes("placeholder") && 
         !serviceRoleKey.includes("your-service-role-key-here");
}

function getSupabaseClient(sessionId: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (isServiceRoleValid()) {
    return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  
  const cookieStore = cookies();
  return createSupabaseSsrClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store?.getAll() ?? []
        },
        async setAll(cookiesToSet) {
          const store = await cookieStore;
          if (store) {
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
            )
          }
        },
      },
      global: {
        headers: {
          ...(sessionId ? { "x-session-id": sessionId } : {})
        }
      }
    }
  );
}

export async function getBookingDetailsServer(bookingId: string, sessionIdParam?: string | null) {
  if (!bookingId) return null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;

    const cookieStore = await cookies();
    const sessionId = sessionIdParam || cookieStore.get("atena_session_id")?.value || cookieStore.get("booking_session_id")?.value || null;

    const supabase = getSupabaseClient(sessionId);

    let { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      const serverClient = createServerClient();
      const { data: serverBooking } = await serverClient
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();
      booking = serverBooking;
    }

    if (!booking) {
      console.error("Error fetching booking details: booking not found for id", bookingId);
      return null;
    }

    // Fetch the linked course/shop item info
    let itemData: any = null;
    if (booking.item_type === "course" || !booking.item_type) {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data;
    }
    if (!itemData) {
      const { data } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", booking.item_id)
        .maybeSingle();
      itemData = data;
    }

    return {
      ...booking,
      item_name: itemData?.title_it || itemData?.name || itemData?.title || null,
      item_price: itemData?.price || booking?.amount || booking?.price || null,
      item_photo: itemData?.photo_url || null,
      item_teacher: itemData?.teacher_name || null,
      date: booking.booking_date || null,
      time: booking.booking_time || null,
    };
  } catch (err) {
    console.error("Failed to run getBookingDetailsServer server action:", err);
    return null;
  }
}

export async function deleteBookingServerAction(bookingId: string, sessionId: string | null) {
  try {
    const authClient = createServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    const client = getSupabaseClient(sessionId);

    // Verify ownership on server-side before deleting
    let query = client
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
    if (!isServiceRoleValid()) {
      return { 
        success: false, 
        error: "Для симуляции оплаты (установки статуса paid) в локальной среде разработки, пожалуйста, укажите настоящий SUPABASE_SERVICE_ROLE_KEY в вашем .env файле." 
      };
    }

    const authClient = createServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
    const authClient = createServerClient();
    const { data: { user } } = await authClient.auth.getUser();

    const { type, id, dateParam, timeParam, slotIdParam, values, sessionId, origin } = params;
    const client = getSupabaseClient(sessionId || null);

    // Check for existing pending/reserved booking to prevent duplicate rows
    const { data: existingBooking } = await client
      .from("bookings")
      .select("id")
      .eq("student_email", values.email)
      .eq("item_id", id)
      .in("status", ["pending_payment", "reserved"])
      .maybeSingle();

    let booking;
    if (existingBooking) {
      const { data: updatedBooking, error: bookingError } = await client
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
      const { data: insertedBooking, error: bookingError } = await client
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

        await authClient.auth.signInWithOtp({
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

export async function getCartCountAction(sessionId: string | null) {
  try {
    const authClient = createServerClient();
    const { data: { user: currentUser } } = await authClient.auth.getUser();

    const client = getSupabaseClient(sessionId);

    let query = client
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_cart");

    if (currentUser) {
      query = query.eq("user_id", currentUser.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return { success: true, count: 0 };
    }

    const { count, error } = await query;
    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (err: any) {
    console.error("Failed to run getCartCountAction:", err);
    return { success: false, count: 0, error: err.message || "Failed to fetch cart count" };
  }
}

export async function fetchCartItemsAction(sessionId: string | null) {
  try {
    const authClient = createServerClient();
    const { data: { user: currentUser } } = await authClient.auth.getUser();

    const client = getSupabaseClient(sessionId);

    let query = client
      .from("bookings")
      .select("*")
      .eq("status", "in_cart");

    if (currentUser) {
      query = query.eq("user_id", currentUser.id);
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
          const table = b.item_type === "course" ? "courses" : "shop_items";
          const { data: itemData, error: itemError } = await client
            .from(table)
            .select("*")
            .eq("id", b.item_id)
            .single();

          if (itemError) {
            console.error(`Error fetching item ${b.item_id} from ${table}:`, itemError);
          }

          const title = itemData?.title_it || itemData?.name || "Unknown";
          const price = itemData?.price_eur || itemData?.price || "0";

          return {
            ...b,
            title,
            price: typeof price === "number" ? `${price}€` : price,
            teacher: itemData?.teacher_name || "TBD",
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

export async function mergeGuestBookingsAction(sessionId: string) {
  try {
    const authClient = createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const client = getSupabaseClient(sessionId);

    // Call the database function/update to link guest bookings
    // 1. By session ID
    if (sessionId) {
      const { error: sessionError } = await client
        .from("bookings")
        .update({ user_id: user.id, session_id: null })
        .eq("session_id", sessionId);

      if (sessionError) {
        console.error("Failed to link guest bookings by session_id:", sessionError);
      }
    }

    // 2. By email (if email matches the verified logged-in user email)
    if (user.email) {
      const { error: emailError } = await client
        .from("bookings")
        .update({ user_id: user.id })
        .ilike("student_email", user.email)
        .is("user_id", null);

      if (emailError) {
        console.error("Failed to link guest bookings by email:", emailError);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to run mergeGuestBookingsAction:", err);
    return { success: false, error: err.message || "Failed to merge guest bookings" };
  }
}

export async function fetchScheduleSlotsAction(dateStr: string) {
  try {
    const supabase = createServerClient();
    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("schedule_slots")
      .select("*")
      .gte("starts_at", startOfDay.toISOString())
      .lte("starts_at", endOfDay.toISOString())
      .order("starts_at", { ascending: true });

    if (error) throw error;
    return { success: true, slots: data || [] };
  } catch (err: any) {
    console.error("Failed to run fetchScheduleSlotsAction:", err);
    return { success: false, slots: [], error: err.message || "Failed to fetch schedule slots" };
  }
}

export async function fetchCheckoutItemAction(type: string, id: string) {
  try {
    const supabase = createServerClient();
    const table = type === "course" ? "courses" : "shop_items";
    let { data: itemData } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!itemData && table === "courses") {
      const { data: itemBySlug } = await supabase
        .from("courses")
        .select("*")
        .ilike("name", `%${id}%`)
        .maybeSingle();
      itemData = itemBySlug;
    }

    return { success: true, item: itemData || null };
  } catch (err: any) {
    console.error("Failed to run fetchCheckoutItemAction:", err);
    return { success: false, item: null, error: err.message || "Failed to fetch item details" };
  }
}

export async function initiateStripePaymentAction(params: {
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
}) {
  try {
    const headerList = await cookies();
    const headersData = await headers();
    const host = headersData.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const authHeader = session?.access_token
      ? `Bearer ${session.access_token}`
      : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          itemId: params.id,
          itemType: params.type,
          customerEmail: params.values.email,
          firstName: params.values.firstName,
          lastName: params.values.lastName,
          phone: params.values.phone,
          date: params.dateParam,
          time: params.timeParam,
          slotId: params.slotIdParam || null,
          locale: "it",
          origin,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore durante il pagamento");

    return { success: true, url: data.url };
  } catch (err: any) {
    console.error("Failed to run initiateStripePaymentAction:", err);
    return { success: false, error: err.message || "Failed to initiate payment" };
  }
}

export async function dispatchMagicLinkAction(email: string) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to run dispatchMagicLinkAction:", err);
    return { success: false, error: err.message || "Failed to send magic link" };
  }
}

export async function getCurrentUserAction() {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return { success: true, user };
  } catch {
    return { success: false, user: null };
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

