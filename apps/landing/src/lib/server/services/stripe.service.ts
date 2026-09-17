import Stripe from 'stripe';
import {
  BookingPaymentStatus,
  PaymentMethod,
  PaymentRecordStatus,
  StudentStatus,
  AppSettingKey,
} from '@atena/api-types';
import { getSupabaseAdmin } from '../supabase-admin';
import { CreateReservationParams, VerifyPaymentParams } from './types';
import { createReservation } from './reservation.service';

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(secretKey, { apiVersion: '2023-10-16' as Stripe.StripeConfig['apiVersion'] });
}

export async function getSystemSettings(): Promise<{ stripeEnabled: boolean }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', AppSettingKey.STRIPE_ENABLED)
      .maybeSingle();

    if (!error && data?.value !== undefined && data?.value !== null) {
      if (typeof data.value === 'boolean') return { stripeEnabled: data.value };
      if (typeof data.value === 'string') return { stripeEnabled: data.value === 'true' };
      if (typeof data.value === 'object' && data.value !== null && 'enabled' in data.value) {
        return { stripeEnabled: Boolean((data.value as { enabled?: boolean }).enabled) };
      }
    }
  } catch (err) {
    console.warn('[getSystemSettings fallback]:', err);
  }

  // Default fallback (disabled for MVP unless explicitly enabled in env)
  const envEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true' || process.env.ENABLE_STRIPE === 'true';
  return { stripeEnabled: envEnabled };
}

export async function updateSystemSettings(settings: { stripeEnabled: boolean }): Promise<{ stripeEnabled: boolean }> {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from('app_settings').upsert({
      key: AppSettingKey.STRIPE_ENABLED,
      value: settings.stripeEnabled,
      description: 'Enable or disable Stripe online payment gateway on checkout',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[updateSystemSettings error]:', err);
    throw err;
  }
  return { stripeEnabled: settings.stripeEnabled };
}

export async function createStripeSession(dto: CreateReservationParams) {
  const settings = await getSystemSettings();
  if (!settings.stripeEnabled) {
    throw new Error('I pagamenti online sono temporaneamente disabilitati. Si prega di selezionare la prenotazione con saldo in sede.');
  }

  const supabase = getSupabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  let resolvedItemId = dto.itemId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  if (!isUuid) {
    const { data: course } = await supabase.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
    if (course?.id) {
      resolvedItemId = course.id;
    }
  }

  // If multi-student payload is provided, create direct Stripe Session with all student line items
  if (dto.students && dto.students.length > 0) {
    const reservationRes = await createReservation({
      ...dto,
      paymentMethod: PaymentMethod.STRIPE,
      paymentStatus: BookingPaymentStatus.PENDING,
    });

    const { data: course } = await supabase.from('courses').select('*').eq('id', resolvedItemId).maybeSingle();
    const courseName = course?.name || course?.title_it || 'Corso Atena School';
    const coursePrice = course ? Number(course.price) : 73.2;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const b of reservationRes.bookings) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${courseName} — ${b.student_name}`,
          },
          unit_amount: Math.round(coursePrice * 100),
        },
        quantity: 1,
      });

      const regFee = Number(b.registration_fee || 0);
      if (regFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Quota Iscrizione Annuale 2026/2027 — ${b.student_name}`,
            },
            unit_amount: Math.round(regFee * 100),
          },
          quantity: 1,
        });
      }
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: dto.email,
      success_url: `${siteUrl}/checkout/success/${reservationRes.bookingId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
      metadata: {
        booking_id: reservationRes.bookingId,
        booking_ids: reservationRes.bookingIds.join(','),
        purchaser_tax_code: dto.purchaserTaxCode || '',
      },
    }, {
      idempotencyKey: dto.idempotencyKey ? `stripe_sess_${dto.idempotencyKey}` : `stripe_sess_${reservationRes.bookingId}`,
    });

    return { success: true, url: session.url, bookingId: reservationRes.bookingId };
  }

  // 1. Primary: Invoke Supabase Edge Function 'create-checkout-session' (creates 1 booking + 1 Stripe session)
  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        itemType: dto.itemType || 'course',
        itemId: resolvedItemId,
        date: dto.date,
        time: dto.time,
        firstName: dto.firstName,
        lastName: dto.lastName,
        customerEmail: dto.email,
        phone: dto.phone,
        notes: dto.notes,
        studentFirstName: dto.studentFirstName,
        studentLastName: dto.studentLastName,
        studentEmail: dto.studentEmail,
        studentPhone: dto.studentPhone,
        purchaserTaxCode: dto.purchaserTaxCode,
        taxCode: dto.studentTaxCode || dto.purchaserTaxCode,
        studentBirthDate: dto.studentBirthDate,
        needsCompanyInvoice: dto.needsCompanyInvoice,
        sdiCode: dto.sdiCode,
        pecEmail: dto.pecEmail,
        includeRegistrationFee: dto.includeRegistrationFee,
        isForChild: dto.isForChild,
        origin: siteUrl,
      },
    });

    if (!edgeErr && edgeData?.url) {
      return { success: true, url: edgeData.url, bookingId: edgeData.bookingId };
    }
    if (edgeErr || edgeData?.error) {
      console.warn('[Supabase Edge Function Warning]:', edgeErr?.message || edgeData?.error);
    }
  } catch (invokeErr: unknown) {
    const msg = invokeErr instanceof Error ? invokeErr.message : String(invokeErr);
    console.warn('[Supabase Functions Invoke Failed, fallback to direct Stripe SDK]:', msg);
  }

  // 2. Fallback ONLY if Edge Function fails: Direct Stripe SDK session creation
  const reservationRes = await createReservation({
    ...dto,
    paymentMethod: PaymentMethod.STRIPE,
    paymentStatus: BookingPaymentStatus.PENDING,
  });

  const booking = reservationRes.booking;
  const coursePrice = Number(booking.amount_paid) - Number(booking.registration_fee || 0);
  const regFee = Number(booking.registration_fee || 0);

  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: booking.course_name || 'Corso Atena School',
        },
        unit_amount: Math.round(coursePrice * 100),
      },
      quantity: 1,
    },
  ];

  if (regFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Quota Associativa / Iscrizione Annuale (2026/2027)',
        },
        unit_amount: Math.round(regFee * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: dto.email,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
    metadata: {
      booking_id: booking.id,
      purchaser_tax_code: dto.purchaserTaxCode || '',
      student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
    },
  }, {
    idempotencyKey: dto.idempotencyKey ? `stripe_sess_${dto.idempotencyKey}` : `stripe_sess_${booking.id}`,
  });

  return { success: true, url: session.url, bookingId: booking.id };
}

export async function verifyPayment(params: VerifyPaymentParams) {
  const supabase = getSupabaseAdmin();
  const { sessionId, bookingId } = params;

  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('verify-payment', {
      body: {
        session_id: sessionId,
        booking_id: bookingId,
      },
    });
    if (!edgeErr && edgeData?.booking) {
      return { success: true, booking: edgeData.booking };
    }
  } catch (edgeErr) {
    console.warn('Supabase edge verify-payment warning:', edgeErr);
  }

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const targetBookingId = bookingId || (session.metadata?.booking_id as string);
        if (targetBookingId) {
          const { data: updatedBooking } = await supabase
            .from('bookings')
            .update({ payment_status: BookingPaymentStatus.PAID, payment_method: PaymentMethod.STRIPE })
            .eq('id', targetBookingId)
            .select('student_id, student_tax_code')
            .maybeSingle();

          await supabase.from('payments').update({ status: PaymentRecordStatus.SUCCEEDED }).eq('booking_id', targetBookingId);

          if (updatedBooking?.student_id) {
            await supabase.from('students').update({
              status: StudentStatus.ACTIVE,
              annual_fee_paid: true,
              annual_fee_paid_at: new Date().toISOString(),
            }).eq('id', updatedBooking.student_id);
          }
        }
      }
    } catch (err) {
      console.warn('Verify payment stripe check warning:', err);
    }
  }

  if (bookingId) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
    return { success: true, booking };
  }

  return { success: true };
}

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Stripe webhook signature verification failed: ${msg}`);
  }

  const supabase = getSupabaseAdmin();

  if (event && event.id) {
    const { data: existingEvent } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent) {
      return { received: true, duplicate: true };
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingIdsStr = session.metadata?.booking_ids || session.metadata?.booking_id;
    if (bookingIdsStr) {
      const ids = bookingIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
      for (const bId of ids) {
        const { data: updatedBooking } = await supabase
          .from('bookings')
          .update({ payment_status: BookingPaymentStatus.PAID, payment_method: PaymentMethod.STRIPE })
          .eq('id', bId)
          .select('student_id, student_tax_code')
          .maybeSingle();

        await supabase.from('payments').update({ status: PaymentRecordStatus.SUCCEEDED }).eq('booking_id', bId);

        if (updatedBooking?.student_id) {
          await supabase.from('students').update({
            status: StudentStatus.ACTIVE,
            annual_fee_paid: true,
            annual_fee_paid_at: new Date().toISOString(),
          }).eq('id', updatedBooking.student_id);
        }
      }
    }
  }

  if (event && event.id) {
    await supabase.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });
  }

  return { received: true };
}
