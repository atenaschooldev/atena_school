import Stripe from "https://esm.sh/stripe@14.16.0";
import { Resend } from "https://esm.sh/resend@2.1.0";
import { createSupabaseAdmin, createStripe } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Webhook secret or signature missing", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = createStripe();
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[stripe-webhook] Signature error:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();
    const SITE_URL = Deno.env.get("SITE_URL") || "https://atena-school-landing-three.vercel.app";

    // Atomically record event for idempotency check
    const { error: idempotencyErr } = await supabaseAdmin
      .from("stripe_webhook_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      });

    if (idempotencyErr) {
      // Postgres error code 23505 = unique_violation
      if (idempotencyErr.code === "23505") {
        console.log(`[stripe-webhook] Event ${event.id} already processed. Skipping.`);
        return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
      }
      console.error("[stripe-webhook] Idempotency record error:", idempotencyErr);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.warn("[stripe-webhook] checkout.session.completed without booking_id in metadata");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Fetch full booking
      const { data: booking, error: fetchBookingErr } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (fetchBookingErr || !booking) {
        console.error("[stripe-webhook] Booking not found:", fetchBookingErr || bookingId);
        return new Response("Booking not found", { status: 404 });
      }

      const cid = booking.course_id || booking.item_id;
      const bdate = booking.start_date || booking.booking_date;

      const itemTable = "courses";
      const { data: itemData } = await supabaseAdmin
        .from(itemTable)
        .select("*")
        .eq("id", cid)
        .single();

      let subStartsAt = new Date(bdate).toISOString();
      let subEndsAt = subStartsAt;
      let lessons: ScheduledLesson[] = [];

      if (itemData) {
        lessons = calculateLessonDates(
          bdate,
          booking.booking_time,
          itemData.category || "",
          itemData.schedule_days,
          itemData.lesson_duration_minutes || 60,
          itemData.start_time,
          itemData.end_time,
          itemData.schedule_type
        );

        subStartsAt = lessons.length > 0 ? lessons[0].startsAt : new Date(bdate).toISOString();
        const subEndsAtDate = new Date(subStartsAt);
        subEndsAtDate.setMonth(subEndsAtDate.getMonth() + 1);
        subEndsAt = subEndsAtDate.toISOString();
      }

      const paidAmount = session.amount_total ? session.amount_total / 100 : (booking.amount_paid || 0);

      // Update booking status to 'paid' and populate subscription bounds
      const { error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({ 
          payment_status: "paid",
          booking_status: "active",
          amount_paid: paidAmount,
          total_lessons_count: lessons.length || booking.total_lessons_count || itemData?.total_lessons || 1,
          subscription_starts_at: subStartsAt,
          subscription_ends_at: subEndsAt
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("[stripe-webhook] Failed to update booking:", updateError);
        return new Response("Failed to update booking", { status: 500 });
      }

      // If registration fee was paid, upsert annual_memberships and update student record
      const regFee = Number(booking.registration_fee || 0);
      const studentTaxCode = (booking.student_tax_code || booking.purchaser_tax_code || "").trim().toUpperCase();
      const studentEmail = (booking.student_email || booking.purchaser_email || "").trim().toLowerCase();
      const studentPhone = (booking.student_phone || booking.purchaser_phone || "").trim();

      if (regFee > 0) {
        let targetStudentId = booking.student_id;
        if (!targetStudentId && studentTaxCode) {
          const { data: existingStudent } = await supabaseAdmin
            .from("students")
            .select("id")
            .ilike("tax_code", studentTaxCode)
            .maybeSingle();

          if (existingStudent) {
            targetStudentId = existingStudent.id;
          } else {
            const parts = (booking.student_name || booking.purchaser_name || "Studente").split(" ");
            const { data: newStudent } = await supabaseAdmin
              .from("students")
              .insert({
                first_name: parts[0] || "",
                last_name: parts.slice(1).join(" ") || "",
                full_name: booking.student_name || booking.purchaser_name || "Studente",
                email: studentEmail,
                phone: studentPhone,
                tax_code: studentTaxCode,
                annual_fee_paid: true,
                annual_fee_paid_at: new Date().toISOString(),
              })
              .select("id")
              .maybeSingle();
            if (newStudent) targetStudentId = newStudent.id;
          }
        }

        if (targetStudentId) {
          await supabaseAdmin
            .from("students")
            .update({
              annual_fee_paid: true,
              annual_fee_paid_at: new Date().toISOString(),
            })
            .eq("id", targetStudentId);

          if (!booking.student_id) {
            await supabaseAdmin.from("bookings").update({ student_id: targetStudentId }).eq("id", bookingId);
          }
        }

        await supabaseAdmin.from("annual_memberships").upsert({
          tax_code: studentTaxCode || null,
          email: studentEmail || null,
          phone: studentPhone || null,
          academic_year: "2026/2027",
          status: "active",
          booking_id: bookingId,
          user_id: booking.user_id || null,
          student_id: targetStudentId || null,
          paid_at: new Date().toISOString(),
          expires_at: "2027-08-31T23:59:59.000Z",
        }, { onConflict: "booking_id" });
      }

      const courseAmount = paidAmount - regFee;

      // 1. Record course payment in public.payments ledger
      if (courseAmount > 0) {
        await supabaseAdmin.from("payments").insert({
          booking_id: bookingId,
          user_id: booking.user_id || null,
          amount: courseAmount,
          currency: (session.currency || "eur").toUpperCase(),
          payment_method: "stripe",
          type: "payment",
          status: "succeeded",
          provider: "stripe",
          provider_transaction_id: session.payment_intent || session.id,
          paid_at: new Date().toISOString(),
        });
      }

      // 2. Record annual registration fee as a separate linked transaction in public.payments ledger
      if (regFee > 0) {
        await supabaseAdmin.from("payments").insert({
          booking_id: bookingId,
          user_id: booking.user_id || null,
          amount: regFee,
          currency: (session.currency || "eur").toUpperCase(),
          payment_method: "stripe",
          type: "registration_fee",
          status: "succeeded",
          provider: "stripe",
          provider_transaction_id: session.payment_intent || session.id,
          notes: "Quota d'iscrizione annuale 2026/2027",
          paid_at: new Date().toISOString(),
        });
      }

      if (booking) {
        if (itemData) {
          // Clear old lessons if any and insert new scheduled lessons
          await supabaseAdmin
            .from("lessons")
            .delete()
            .eq("booking_id", bookingId);

          if (lessons.length > 0) {
            const { error: lessonsError } = await supabaseAdmin
              .from("lessons")
              .insert(
                lessons.map((lesson) => ({
                  booking_id: bookingId,
                  starts_at: lesson.startsAt,
                  ends_at: lesson.endsAt,
                  status: "scheduled",
                  teacher_id: itemData.teacher_id || null,
                }))
              );
            if (lessonsError) {
              console.error("[stripe-webhook] Failed to insert lessons:", lessonsError);
            }
          }
        }

        const itemName = itemData
          ? (itemData.name || itemData.title_it || itemData.title_en || "Corso/Lezione")
          : "Corso/Lezione";

        const clientName = booking.student_name || "Cliente";
        const clientEmail = booking.student_email || booking.email;
        const clientPhone = booking.student_phone || booking.phone || "Non specificato";
        const bookingDate = booking.booking_date || "Non specificata";
        const bookingTime = booking.booking_time || "Non specificata";
        const bookingNotes = booking.notes || "Nessuna nota";

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey) {
          try {
            const resend = new Resend(resendApiKey);
            const defaultFrom = Deno.env.get("RESEND_FROM_EMAIL") || "Atena School <info@atena.school>";
            const schoolEmail = Deno.env.get("SCHOOL_EMAIL") || "info@atena.school";

            // 1. Email to the client
            if (clientEmail) {
              await resend.emails.send({
                from: defaultFrom,
                to: [clientEmail],
                subject: "Prenotazione Confermata - Atena School",
                html: `
                  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; min-height: 100%;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 27, 43, 0.05); border: 1px solid #e2e8f0;">
                      <div style="background-color: #0B1B2B; padding: 32px 20px; text-align: center; border-bottom: 4px solid #F8861D;">
                        <img src="${SITE_URL}/athena-logo.webp" alt="Atena School Logo" style="height: 50px; max-width: 100%; object-fit: contain; display: block; margin: 0 auto 16px auto;" />
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Playfair Display', Georgia, serif;">Prenotazione Confermata</h2>
                      </div>
                      <div style="padding: 40px 32px; color: #1e293b;">
                        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">Ciao <strong>${clientName}</strong>,</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #64748b;">Grazie per aver scelto Atena School. La tua prenotazione è stata completata con successo ed è ora attiva. Di seguito trovi il riepilogo dei dettagli:</p>
                        <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #f1f5f9;">
                          <h3 style="margin: 0 0 16px 0; color: #0B1B2B; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Dettagli della Prenotazione</h3>
                          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                              <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Corso/Servizio:</strong></td>
                              <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${itemName}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;"><strong>Data:</strong></td>
                              <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${bookingDate}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #64748b;"><strong>Orario:</strong></td>
                              <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${bookingTime}</td>
                            </tr>
                          </table>
                        </div>
                        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 0;">Ti aspettiamo! Se hai bisogno di assistenza o vuoi modificare il tuo appuntamento, rispondi direttamente a questa email o contattaci tramite il sito.</p>
                      </div>
                      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                        Atena School © 2026. Tutti i diritti riservati.<br/>
                        <a href="${SITE_URL}" style="color: #0B1B2B; font-weight: 600; text-decoration: none; margin-top: 4px; display: inline-block;">www.atenaschool.com</a>
                      </div>
                    </div>
                  </div>
                `,
              });
            }

            // 2. Email to the school
            await resend.emails.send({
              from: defaultFrom,
              to: [schoolEmail],
              subject: "Nuova Prenotazione Ricevuta - Atena School",
              html: `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; padding: 40px 20px; min-height: 100%;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 27, 43, 0.05); border: 1px solid #e2e8f0;">
                    <div style="background-color: #0B1B2B; padding: 32px 20px; text-align: center; border-bottom: 4px solid #F8861D;">
                      <img src="${SITE_URL}/athena-logo.webp" alt="Atena School Logo" style="height: 50px; max-width: 100%; object-fit: contain; display: block; margin: 0 auto 16px auto;" />
                      <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; font-family: 'Playfair Display', Georgia, serif;">Nuova Prenotazione</h2>
                    </div>
                    <div style="padding: 40px 32px; color: #1e293b;">
                      <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-top: 0;">Un utente ha completato con successo il pagamento e la prenotazione di un corso/servizio.</p>
                      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #f1f5f9;">
                        <h3 style="margin: 0 0 16px 0; color: #0B1B2B; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Dettagli Cliente</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Nome:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${clientName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;"><a href="mailto:${clientEmail || ""}" style="color: #0B1B2B; text-decoration: none;">${clientEmail || "Non specificata"}</a></td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Telefono:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${clientPhone}</td>
                          </tr>
                        </table>
                      </div>
                      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #f1f5f9;">
                        <h3 style="margin: 0 0 16px 0; color: #0B1B2B; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Dettagli Prenotazione</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Corso/Servizio:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${itemName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Data:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${bookingDate}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Orario:</strong></td>
                            <td style="padding: 8px 0; color: #0B1B2B; font-weight: 600;">${bookingTime}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #64748b;"><strong>Note:</strong></td>
                            <td style="padding: 8px 0; color: #64748b; font-style: italic;">${bookingNotes}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                      Piattaforma Web Back-office <a href="${SITE_URL}" style="color: #0B1B2B; font-weight: 600; text-decoration: none;">Atena School</a>
                    </div>
                  </div>
                </div>
              `,
            });
          } catch (emailErr) {
            // Email failure is logged but does NOT fail the webhook — Stripe would retry forever otherwise
            console.error("[stripe-webhook] Error sending emails:", emailErr);
          }
        }
      }

      console.log(`[stripe-webhook] Successfully processed booking: ${bookingId}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[stripe-webhook] Handler error:", message);
    return new Response(`Webhook Error: ${message}`, { status: 500 });
  }
});

function getRomeOffsetHours(date: Date): number {
  const romeString = date.toLocaleString("en-US", { timeZone: "Europe/Rome" });
  const utcString = date.toLocaleString("en-US", { timeZone: "UTC" });
  
  const romeDate = new Date(romeString);
  const utcDate = new Date(utcString);
  
  return Math.round((romeDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60));
}

interface ScheduledLesson {
  startsAt: string;
  endsAt: string;
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

function calculateLessonDates(
  startDateStr: string,
  timeParam: string,
  category: string,
  scheduleDaysOrLegacySchedule?: number[] | string | null,
  durationStr: string | number = 60,
  startTimeParam?: string | null,
  endTimeParam?: string | null,
  scheduleType?: string | null
): ScheduledLesson[] {
  const lessons: ScheduledLesson[] = [];
  const durationMinutes = typeof durationStr === "number"
    ? durationStr
    : parseDurationToMinutes(durationStr);
  
  const baseDate = new Date(startDateStr);
  const isFlexible = scheduleType === "flexible" || !scheduleDaysOrLegacySchedule;

  if (isFlexible) {
    const timeMatch = (timeParam || "").match(/^(\d{2}):(\d{2})$/);
    const startHour = timeMatch ? parseInt(timeMatch[1], 10) : 10;
    const startMin = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    const startsAt = new Date(baseDate);
    startsAt.setUTCHours(12, 0, 0, 0);
    const offset = getRomeOffsetHours(startsAt);

    startsAt.setUTCHours(startHour - offset, startMin, 0, 0);

    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

    lessons.push({
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });
    return lessons;
  }

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };
  const endDate = addMonths(baseDate, 1);

  const targetDays: number[] = Array.isArray(scheduleDaysOrLegacySchedule)
    ? scheduleDaysOrLegacySchedule
    : [];

  if (targetDays.length === 0) {
    targetDays.push(baseDate.getDay());
  }

  let startHour = 16, startMin = 0;
  if (startTimeParam) {
    const sMatch = startTimeParam.match(/^(\d{2}):(\d{2})$/);
    if (sMatch) {
      startHour = parseInt(sMatch[1], 10);
      startMin = parseInt(sMatch[2], 10);
    }
  }

  let current = new Date(baseDate);

  let attempts = 0;
  while (current <= endDate && attempts < 60) {
    attempts++;
    const dayOfWeek = current.getDay();
    if (targetDays.includes(dayOfWeek)) {
      const startsAt = new Date(current);
      startsAt.setUTCHours(12, 0, 0, 0);
      const offset = getRomeOffsetHours(startsAt);

      startsAt.setUTCHours(startHour - offset, startMin, 0, 0);

      const endsAt = new Date(startsAt);
      if (endTimeParam) {
        const eMatch = endTimeParam.match(/^(\d{2}):(\d{2})$/);
        if (eMatch) {
          endsAt.setUTCHours(parseInt(eMatch[1], 10) - offset, parseInt(eMatch[2], 10), 0, 0);
        } else {
          endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
        }
      } else {
        endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
      }

      lessons.push({
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return lessons;
}
