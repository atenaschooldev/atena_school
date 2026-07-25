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
      .update({ payment_status: "paid" })
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

    const regFee = Number(bookingData?.registration_fee || 0);
    const amountPaid = Number(bookingData?.amount_paid || 0);
    const calculatedCoursePrice = amountPaid > 0 ? amountPaid - regFee : 0;

    let itemData: Record<string, unknown> | null = null;
    const cid = bookingData?.course_id ?? bookingData?.item_id;
    if (cid) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(cid));
      if (isUuid) {
        const { data } = await supabaseAdmin
          .from("courses")
          .select("*, teachers(teacher_id, full_name)")
          .eq("id", cid)
          .maybeSingle();
        itemData = data;
      }
      if (!itemData) {
        const { data } = await supabaseAdmin
          .from("courses")
          .select("*, teachers(teacher_id, full_name)")
          .eq("slug", cid)
          .maybeSingle();
        itemData = data;
      }
    }

    if (!itemData && calculatedCoursePrice > 0) {
      const { data: allCourses } = await supabaseAdmin
        .from("courses")
        .select("*, teachers(teacher_id, full_name)");
      if (allCourses && allCourses.length > 0) {
        const matched = allCourses.find((c: any) => {
          const cPrice = parseFloat(String(c.price || 0).replace(/[^0-9.,]/g, "").replace(",", "."));
          return Math.abs(cPrice - calculatedCoursePrice) < 0.05;
        });
        if (matched) itemData = matched as Record<string, unknown>;
      }
    }

    const rawCoursePrice = itemData?.price ? Number(itemData.price) : calculatedCoursePrice;
    const coursePrice = rawCoursePrice > 0 ? rawCoursePrice : Math.max(0, amountPaid - regFee);
    const courseName = (bookingData?.course_name ?? itemData?.name ?? itemData?.title_it ?? itemData?.title ?? "Corso Atena School") as string;

    const fullBooking = bookingData
      ? {
          ...bookingData,
          course_id: cid,
          item_id: cid,
          item_name: courseName,
          course_name: courseName,
          item_price: coursePrice,
          course_price: coursePrice,
          registration_fee: regFee,
          amount_paid: amountPaid > 0 ? amountPaid : coursePrice + regFee,
          item_photo: itemData?.photo_url ?? null,
          item_teacher: (itemData?.teachers as any)?.full_name ?? null,
          date: bookingData.start_date ?? bookingData.booking_date ?? null,
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
