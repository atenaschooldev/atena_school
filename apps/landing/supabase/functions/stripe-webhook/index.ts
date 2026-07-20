import Stripe from "https://esm.sh/stripe@14.16.0";
import { Resend } from "https://esm.sh/resend@2.1.0";
import { createSupabaseAdmin, createStripe } from "../_shared/utils.ts";

const stripe = createStripe();
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Webhook secret or signature missing", { status: 400 });
  }

  let event: Stripe.Event;
  try {
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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.warn("[stripe-webhook] checkout.session.completed without booking_id in metadata");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      // Update booking status to 'paid'
      const { error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId);

      if (updateError) {
        console.error("[stripe-webhook] Failed to update booking:", updateError);
        // Return 500 so Stripe will retry the webhook
        return new Response("Failed to update booking", { status: 500 });
      }

      // Fetch full booking for email
      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (booking) {
        const itemTable = booking.item_type === "course" ? "courses" : "shop_items";
        const { data: itemData } = await supabaseAdmin
          .from(itemTable)
          .select("*")
          .eq("id", booking.item_id)
          .single();

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
