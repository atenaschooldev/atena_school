import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@14.16.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Ключ для Deno Crypto Provider, необходим для валидации подписи Stripe Webhook
const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Webhook secret or signature missing', { status: 400 });
  }

  try {
    const body = await req.text();
    // Валидация подписи
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Обработка успешного платежа
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const slotId = session.metadata?.slot_id;

      if (bookingId) {
        // Обновляем статус бронирования на 'paid'
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'paid' })
          .eq('id', bookingId);
      }

      if (slotId) {
        // Помечаем слот расписания как занятый (is_booked = true)
        await supabaseAdmin
          .from('schedule_slots')
          .update({ is_booked: true })
          .eq('id', slotId);
      }
      
      console.log(`Successfully processed booking: ${bookingId}, slot: ${slotId}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
