import { handleCors, jsonResponse, createSupabaseAdmin, createStripe } from "../_shared/utils.ts";

const stripe = createStripe();

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { session_id, booking_id } = await req.json();

    if (!session_id || !booking_id) {
      return jsonResponse({ error: "Missing session_id or booking_id" }, 400, req);
    }

    // 1. Verify the Stripe session is actually paid
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return jsonResponse({ error: "Payment not completed", status: session.payment_status }, 402, req);
    }

    // 2. Confirm the booking_id matches the session metadata (security check)
    if (session.metadata?.booking_id !== booking_id) {
      return jsonResponse({ error: "Booking ID mismatch" }, 403, req);
    }

    // 3. Update booking status to "paid" using service role
    const supabaseAdmin = createSupabaseAdmin();

    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "paid" })
      .eq("id", booking_id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    let bookingData = updatedBooking;
    if (!bookingData) {
      const { data: bData } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", booking_id)
        .maybeSingle();
      bookingData = bData;
    }

    let itemData: Record<string, unknown> | null = null;
    if (bookingData?.item_id) {
      const table = bookingData.item_type === "course" ? "courses" : "shop_items";
      const { data } = await supabaseAdmin
        .from(table)
        .select("*")
        .eq("id", bookingData.item_id)
        .maybeSingle();
      itemData = data;
    }

    const fullBooking = bookingData
      ? {
          ...bookingData,
          item_name: itemData?.title_it ?? itemData?.name ?? itemData?.title ?? null,
          item_price: itemData?.price ?? bookingData?.amount ?? bookingData?.price ?? null,
          item_photo: itemData?.photo_url ?? null,
          item_teacher: itemData?.teacher_name ?? null,
          date: bookingData.booking_date ?? null,
          time: bookingData.booking_time ?? null,
        }
      : null;

    return jsonResponse({ success: true, booking: fullBooking }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[verify-payment]", err);
    return jsonResponse({ error: message }, 500, req);
  }
});
