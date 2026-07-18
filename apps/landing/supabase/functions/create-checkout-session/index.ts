import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@14.16.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Обработка CORS (preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { itemId, itemType, customerEmail, firstName, lastName, phone, date, time, slotId, locale } = await req.json();

    // 1. Получаем данные об услуге
    const table = itemType === "course" ? "courses" : "shop_items";
    const { data: itemData, error: itemError } = await supabaseClient
      .from(table)
      .select("*")
      .eq("id", itemId)
      .single();

    if (itemError || !itemData) throw new Error("Item not found");

    const title = itemData[`title_${locale || 'it'}`] || itemData.title_it || 'Lesson';
    // Stripe ожидает сумму в центах (smallest currency unit)
    const amountStr = String(itemData.price).replace(/[^0-9.,]/g, "").replace(",", ".");
    const unitAmount = Math.round(parseFloat(amountStr || "0") * 100);

    // 2. Создаем черновик бронирования через Service Role,
    // так как неавторизованные пользователи (гости) могут не иметь права писать в таблицу status = 'pending_payment'
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: booking, error: bookingError } = await supabaseAdmin.from("bookings").insert({
      user_id: user?.id || null,
      item_id: itemId,
      item_type: itemType,
      slot_id: slotId || null,
      booking_date: date,
      booking_time: time,
      student_name: `${firstName} ${lastName}`.trim(),
      student_email: customerEmail,
      student_phone: phone,
      status: "pending_payment",
      locale: locale || "it",
    }).select().single();

    if (bookingError) throw bookingError;

    const SITE_URL = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'http://localhost:3000';

    // 3. Создаем Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: title,
              description: `Date: ${date} Time: ${time}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${SITE_URL}/checkout/${itemType}/${itemId}?date=${date}&time=${time}`,
      metadata: {
        booking_id: booking.id,
        slot_id: slotId || ""
      }
    });

    // 4. Возвращаем URL пользователю для редиректа
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
