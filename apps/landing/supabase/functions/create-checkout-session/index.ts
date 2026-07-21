import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { handleCors, jsonResponse, createSupabaseAdmin, createStripe } from "../_shared/utils.ts";

const stripe = createStripe();

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const {
      itemId, itemType, customerEmail, firstName, lastName,
      phone, date, time, slotId, locale, origin, notes, guestSessionId,
    } = await req.json();

    const isValidUuid = (id?: string | null) => {
      if (!id) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };
    const resolvedSlotId = isValidUuid(slotId) ? slotId : null;

    // Resolve the authenticated user (may be null for guests)
    const { data: { user } } = await supabaseClient.auth.getUser();

    // 1. Fetch the item from DB
    const table = itemType === "course" ? "courses" : "shop_items";
    const { data: itemData, error: itemError } = await supabaseClient
      .from(table)
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !itemData) {
      return jsonResponse({ error: "Item not found" }, 404, req);
    }

    const title = itemData[`title_${locale || "it"}`] || itemData.title_it || itemData.name || "Lesson";

    // Validate price before sending to Stripe
    const amountStr = String(itemData.price).replace(/[^0-9.,]/g, "").replace(",", ".");
    const unitAmount = Math.round(parseFloat(amountStr || "0") * 100);

    if (!unitAmount || unitAmount <= 0 || isNaN(unitAmount)) {
      return jsonResponse({ error: "Invalid item price" }, 422, req);
    }

    // 2. Create draft booking with service role
    //    SECURITY: user_id is always taken from the verified JWT, never from the request body.
    const supabaseAdmin = createSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: user?.id ?? null,
        session_id: guestSessionId ?? null,
        item_id: itemId,
        slot_id: resolvedSlotId,
        booking_date: date,
        booking_time: time,
        student_name: `${firstName} ${lastName}`.trim(),
        student_email: customerEmail,
        student_phone: phone,
        notes: notes ?? "",
        status: "pending_payment",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    const SITE_URL = origin || req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:3000";

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: title,
              description: `Date: ${date} Time: ${time}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}&email=${encodeURIComponent(customerEmail)}`,
      cancel_url: `${SITE_URL}/checkout/${itemType}/${itemId}?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`,
      metadata: {
        booking_id: booking.id,
        slot_id: resolvedSlotId ?? "",
      },
    });

    return jsonResponse({ url: session.url, bookingId: booking.id }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[create-checkout-session]", err);
    return jsonResponse({ error: message }, 500, req);
  }
});
