import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { handleCors, jsonResponse, createSupabaseAdmin, createStripe } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const stripe = createStripe();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const {
      itemType, itemId, date, time, firstName, lastName, customerEmail, phone, notes,
      studentBirthDate, taxCode, purchaserTaxCode: purchaserTaxCodeParam, isForChild, studentFirstName, studentLastName, studentEmail: studentEmailParam, studentPhone: studentPhoneParam,
      needsCompanyInvoice, sdiCode: sdiCodeParam, pecEmail: pecEmailParam,
      includeRegistrationFee, guestSessionId, origin,
    } = await req.json();

    const cleanSdiCode = needsCompanyInvoice && sdiCodeParam ? String(sdiCodeParam).trim().toUpperCase() : null;
    const cleanPecEmail = needsCompanyInvoice && pecEmailParam ? String(pecEmailParam).trim().toLowerCase() : null;

    const purchaserName = `${firstName} ${lastName}`.trim();
    const cleanEmail = customerEmail ? String(customerEmail).trim().toLowerCase() : null;
    const cleanPhone = phone ? String(phone).trim() : null;
    const cleanStudentTaxCode = taxCode ? String(taxCode).trim().toUpperCase() : null;

    const cleanPurchaserTaxCode = isForChild && purchaserTaxCodeParam && String(purchaserTaxCodeParam).trim() !== ""
      ? String(purchaserTaxCodeParam).trim().toUpperCase()
      : cleanStudentTaxCode;

    const studentName = isForChild && studentFirstName
      ? `${studentFirstName} ${studentLastName || ""}`.trim()
      : purchaserName;

    const actualStudentEmail = isForChild && studentEmailParam && String(studentEmailParam).trim() !== ""
      ? String(studentEmailParam).trim().toLowerCase()
      : cleanEmail;

    const actualStudentPhone = isForChild && studentPhoneParam && String(studentPhoneParam).trim() !== ""
      ? String(studentPhoneParam).trim()
      : cleanPhone;

    const supabaseAdmin = createSupabaseAdmin();

    // SERVER-AUTHORITATIVE ZERO-TRUST ANNUAL MEMBERSHIP CHECK
    let hasActiveMembership = false;

    if (cleanStudentTaxCode || actualStudentEmail || actualStudentPhone) {
      let mQuery = supabaseAdmin
        .from("annual_memberships")
        .select("id")
        .eq("academic_year", "2026/2027")
        .eq("status", "active");

      const conds: string[] = [];
      if (cleanStudentTaxCode) conds.push(`tax_code.ilike.${cleanStudentTaxCode}`);
      if (actualStudentEmail) conds.push(`email.ilike.${actualStudentEmail}`);
      if (actualStudentPhone) conds.push(`phone.eq.${actualStudentPhone}`);

      if (conds.length > 0) {
        mQuery = mQuery.or(conds.join(","));
      }

      const { data: mData } = await mQuery.limit(1).maybeSingle();
      if (mData) hasActiveMembership = true;
    }

    const regFeeAmount = hasActiveMembership ? 0 : (includeRegistrationFee !== false ? 3000 : 0); // 30 EUR in cents

    // Sanitize studentBirthDate for Postgres (empty string "" -> null)
    const validBirthDate = (typeof studentBirthDate === "string" && studentBirthDate.trim() !== "" && /^\d{4}-\d{2}-\d{2}$/.test(studentBirthDate.trim()))
      ? studentBirthDate.trim()
      : null;

    // Resolve the authenticated user (may be null for guests)
    let user: any = null;
    try {
      const { data } = await supabaseClient.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }

    // 1. Fetch the item from DB (support both UUID id and text slug)
    const table = itemType === "course" ? "courses" : "shop_items";
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(itemId));
    
    let itemQuery = supabaseAdmin.from(table).select("*");
    if (isUuid) {
      itemQuery = itemQuery.eq("id", itemId);
    } else {
      itemQuery = itemQuery.eq("slug", itemId);
    }
    
    const { data: itemData, error: itemError } = await itemQuery.maybeSingle();

    if (itemError || !itemData) {
      console.error("[create-checkout-session] Item not found:", itemError);
      return jsonResponse({ error: "Item not found" }, 404, req);
    }

    const title = itemData[`title_${"it"}`] || itemData.title_it || itemData.name || "Lesson";

    // Validate price before sending to Stripe
    const amountStr = String(itemData.price).replace(/[^0-9.,]/g, "").replace(",", ".");
    const unitAmount = Math.round(parseFloat(amountStr || "0") * 100);

    if (!unitAmount || unitAmount <= 0 || isNaN(unitAmount)) {
      return jsonResponse({ error: "Invalid item price" }, 422, req);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const isFlexible = itemData.schedule_type === "flexible" || !date || (!itemData.schedule_days || itemData.schedule_days.length === 0);
    const finalBookingDate = date || todayStr;

    const courseScheduleTime = (itemData.start_time && itemData.end_time) ? `${itemData.start_time}-${itemData.end_time}` : null;
    const finalBookingTime = isFlexible ? null : (time || courseScheduleTime);
    const schedulingStatus = isFlexible ? "pending_coordination" : "scheduled";

    const totalAmount = unitAmount + regFeeAmount;

    // 2. Create draft booking with service role
    //    SECURITY: user_id is always taken from the verified JWT, never from the request body.
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: user?.id ?? null,
        session_id: guestSessionId ?? null,
        course_id: itemId,
        start_date: finalBookingDate,
        booking_time: finalBookingTime,
        purchaser_name: purchaserName,
        purchaser_email: cleanEmail,
        purchaser_phone: cleanPhone,
        purchaser_tax_code: cleanPurchaserTaxCode,
        student_name: studentName,
        student_email: actualStudentEmail,
        student_phone: actualStudentPhone,
        student_tax_code: cleanStudentTaxCode,
        student_birth_date: validBirthDate,
        tax_code: cleanStudentTaxCode,
        sdi_code: cleanSdiCode,
        pec_email: cleanPecEmail,
        notes: notes ?? "",
        payment_status: "pending_payment",
        booking_status: "active",
        payment_method: "stripe",
        amount_paid: totalAmount / 100,
        registration_fee: regFeeAmount / 100,
        scheduling_status: schedulingStatus,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("[create-checkout-session] Booking creation error:", bookingError);
      throw bookingError;
    }

    const SITE_URL = origin || req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:3000";

    const lineItems: any[] = [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: title,
            description: finalBookingTime === "Da concordare" ? "Orario flessibile: da concordare con la scuola" : `Date: ${finalBookingDate} Time: ${finalBookingTime}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ];

    if (regFeeAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Quota d'iscrizione annuale (Atena School)",
            description: "Quota d'iscrizione annuale obbligatoria 2026/2027",
          },
          unit_amount: regFeeAmount,
        },
        quantity: 1,
      });
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}&email=${encodeURIComponent(customerEmail)}`,
      cancel_url: `${SITE_URL}/checkout/${itemType}/${itemId}?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`,
      metadata: {
        booking_id: booking.id,
      },
    });

    return jsonResponse({ url: session.url, bookingId: booking.id }, 200, req);
  } catch (err: any) {
    const message = err?.message || err?.details || err?.hint || (typeof err === "string" ? err : JSON.stringify(err));
    console.error("[create-checkout-session] Error:", err);
    return jsonResponse({ error: message }, 500, req);
  }
});
