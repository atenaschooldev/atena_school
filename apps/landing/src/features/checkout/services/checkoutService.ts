import { SupabaseClient } from "@supabase/supabase-js";

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingItem {
  id: string;
  name?: string;
  title_it?: string;
  price: string | number;
  duration?: string;
  description_it?: string;
  image_url?: string;
}

export async function fetchCheckoutItem(
  type: string,
  id: string,
  supabase: SupabaseClient
): Promise<BookingItem | null> {
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

  return itemData || null;
}

export async function createOrUpdateReservation(
  params: {
    type: string;
    id: string;
    dateParam: string;
    timeParam: string;
    slotIdParam?: string | null;
    values: CheckoutFormValues;
    user: any;
    sessionId?: string | null;
  },
  supabase: SupabaseClient
): Promise<{ booking: any }> {
  const { type, id, dateParam, timeParam, slotIdParam, values, user, sessionId } = params;

  // Check for existing pending/reserved booking to prevent duplicate rows
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("student_email", values.email)
    .eq("item_id", id)
    .in("status", ["pending_payment", "reserved"])
    .maybeSingle();

  let booking;
  if (existingBooking) {
    const { data: updatedBooking, error: bookingError } = await supabase
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
    const { data: insertedBooking, error: bookingError } = await supabase
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
      await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: `${values.firstName} ${values.lastName}`,
            phone: values.phone,
          },
        },
      });
    } catch {
      // Non-critical — allow booking redirect even if email provider fails
    }
  }

  return { booking };
}

export async function initiateStripePayment(
  params: {
    type: string;
    id: string;
    dateParam: string;
    timeParam: string;
    slotIdParam?: string | null;
    values: CheckoutFormValues;
  },
  supabase: SupabaseClient
): Promise<{ url: string }> {
  const { type, id, dateParam, timeParam, slotIdParam, values } = params;

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
        itemId: id,
        itemType: type,
        customerEmail: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        date: dateParam,
        time: timeParam,
        slotId: slotIdParam || null,
        locale: "it",
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Errore durante il pagamento");

  return { url: data.url };
}
