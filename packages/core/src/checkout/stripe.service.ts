import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingPaymentStatus,
  PaymentMethod,
  PaymentRecordStatus,
  StudentStatus,
  AppSettingKey,
  BillingScheme,
  SubscriptionStatus,
  PaymentType,
  PaymentCurrency,
  PaymentProvider,
  ACADEMIC_YEAR,
  MembershipStatus,
} from '@atena/api-types';
import { calculateLessonDates } from '@atena/utils';
import { CreateReservationParams, VerifyPaymentParams } from '../types';
import { createReservationWorkflow, generateAndSaveLessons } from './reservation.service';
import { checkFeeStatus } from './fee.service';
import { generateNextMembershipNumber } from '../memberships/number-generator';
import { sendBookingNotificationEmails } from '../notifications/notification.service';
import { sendBookingNotificationTelegram } from '../notifications/telegram-actions.service';
import { computeTotalLessonsCount, computeEndTime, extractCleanTime } from './course.service';

export function getStripeClient(secretKey?: string): Stripe {
  const key = secretKey || process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(key, { apiVersion: '2023-10-16' as Stripe.StripeConfig['apiVersion'] });
}

export async function getSystemSettings(supabase: SupabaseClient): Promise<{ stripeEnabled: boolean; subscriptionsEnabled: boolean }> {
  let stripeEnabled = false;
  let subscriptionsEnabled = false;

  try {
    const { data: settingsRows, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', [AppSettingKey.STRIPE_ENABLED, AppSettingKey.SUBSCRIPTIONS_ENABLED]);

    if (!error && settingsRows && settingsRows.length > 0) {
      for (const row of settingsRows) {
        let boolVal = false;
        if (typeof row.value === 'boolean') boolVal = row.value;
        else if (typeof row.value === 'string') boolVal = row.value === 'true';
        else if (typeof row.value === 'object' && row.value !== null && 'enabled' in row.value) {
          boolVal = Boolean((row.value as { enabled?: boolean }).enabled);
        }

        if (row.key === AppSettingKey.STRIPE_ENABLED) {
          stripeEnabled = boolVal;
        } else if (row.key === AppSettingKey.SUBSCRIPTIONS_ENABLED) {
          subscriptionsEnabled = boolVal;
        }
      }
    }
  } catch (err) {
    console.warn('[getSystemSettings fallback]:', err);
  }

  // Fallback to environment variables if not defined in database
  if (!stripeEnabled) {
    stripeEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true' || process.env.ENABLE_STRIPE === 'true';
  }
  if (!subscriptionsEnabled) {
    subscriptionsEnabled = process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true' || process.env.ENABLE_SUBSCRIPTIONS === 'true';
  }

  return { stripeEnabled, subscriptionsEnabled };
}

export async function updateSystemSettings(
  supabase: SupabaseClient,
  settings: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }
): Promise<{ stripeEnabled: boolean; subscriptionsEnabled: boolean }> {
  try {
    const upserts = [];
    if (settings.stripeEnabled !== undefined) {
      upserts.push({
        key: AppSettingKey.STRIPE_ENABLED,
        value: settings.stripeEnabled,
        description: 'Enable or disable Stripe online payment gateway on checkout',
        updated_at: new Date().toISOString(),
      });
    }
    if (settings.subscriptionsEnabled !== undefined) {
      upserts.push({
        key: AppSettingKey.SUBSCRIPTIONS_ENABLED,
        value: settings.subscriptionsEnabled,
        description: 'Enable or disable monthly recurring subscriptions on checkout',
        updated_at: new Date().toISOString(),
      });
    }

    if (upserts.length > 0) {
      await supabase.from('app_settings').upsert(upserts);
    }
  } catch (err) {
    console.error('[updateSystemSettings error]:', err);
    throw err;
  }
  return await getSystemSettings(supabase);
}

export async function createCustomerPortalSession(
  supabase: SupabaseClient,
  params: {
    customerId?: string;
    bookingId?: string;
    email?: string;
    returnUrl?: string;
    stripe?: Stripe;
  }
) {
  let customerId = params.customerId?.trim();

  if (!customerId && params.bookingId) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('stripe_customer_id')
      .eq('id', params.bookingId)
      .maybeSingle();
    if (booking?.stripe_customer_id) {
      customerId = booking.stripe_customer_id;
    }
  }

  if (!customerId && params.email) {
    const cleanEmail = params.email.trim().toLowerCase();
    const { data: booking } = await supabase
      .from('bookings')
      .select('stripe_customer_id')
      .or(`purchaser_email.ilike.${cleanEmail},student_email.ilike.${cleanEmail}`)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (booking?.stripe_customer_id) {
      customerId = booking.stripe_customer_id;
    }
  }

  if (!customerId) {
    throw new Error('Nessun cliente Stripe o abbonamento attivo trovato per i dati forniti.');
  }

  const stripe = params.stripe || getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: params.returnUrl || `${siteUrl}/checkout`,
  });
  return { success: true, url: session.url };
}

export async function createStripeSession(
  supabase: SupabaseClient,
  dto: CreateReservationParams,
  options?: { stripe?: Stripe; siteUrl?: string }
) {
  const settings = await getSystemSettings(supabase);
  if (!settings.stripeEnabled) {
    throw new Error('Online payments are temporarily disabled. Please choose the pay on-site reservation option.');
  }

  const isSubscription = Number(dto.billingScheme) === BillingScheme.SUBSCRIPTION;
  if (isSubscription && !settings.subscriptionsEnabled) {
    throw new Error('Monthly subscriptions are currently disabled.');
  }

  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const stripe = options?.stripe || getStripeClient();

  let resolvedItemId = dto.itemId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  if (!isUuid) {
    const { data: course } = await supabase.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
    if (course?.id) {
      resolvedItemId = course.id;
    }
  }

  const reservationRes = await createReservationWorkflow(supabase, {
    ...dto,
    paymentMethod: PaymentMethod.STRIPE,
    paymentStatus: BookingPaymentStatus.PENDING,
    billingScheme: isSubscription ? BillingScheme.SUBSCRIPTION : BillingScheme.FULL,
  });

  if (!reservationRes.success || !reservationRes.booking) {
    throw new Error(reservationRes.error || 'Failed to initialize booking for payment');
  }

  const { data: course } = await supabase.from('courses').select('*').eq('id', resolvedItemId).maybeSingle();
  const courseName = course?.name || course?.title_it || 'Corso Atena School';
  const baseCoursePrice = isSubscription
    ? (course?.subscription_price != null ? Number(course.subscription_price) : (Number(course?.price) || 73.2))
    : (course ? Number(course.price) : 73.2);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const b = reservationRes.booking;

  const discount = Number(b.discountAmount || (b as any).discount_amount || 0);
  const discountedPrice = Math.max(0, baseCoursePrice - discount);

  if (isSubscription) {
    if (course?.stripe_monthly_price_id) {
      lineItems.push({
        price: course.stripe_monthly_price_id,
        quantity: 1,
      });
    } else {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${courseName} — Abbonamento Mensile (${b.studentName || `${dto.firstName} ${dto.lastName}`})`,
          },
          unit_amount: Math.round(discountedPrice * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      });
    }
  } else {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${courseName} — Iscrizione (${b.studentName || `${dto.firstName} ${dto.lastName}`})${b.promoCode ? ` [${b.promoCode}]` : ''}`,
        },
        unit_amount: Math.round(discountedPrice * 100),
      },
      quantity: 1,
    });
  }

  const bookingRegFee = Number(b.registrationFee || (b as any).registration_fee || 0);
  if (bookingRegFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Quota Associativa Annuale 2026/2027 (${b.studentName || `${dto.firstName} ${dto.lastName}`})`,
        },
        unit_amount: Math.round(bookingRegFee * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: isSubscription ? 'subscription' : 'payment',
    customer_email: dto.email,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${reservationRes.bookingId}`,
    cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
    metadata: {
      booking_id: reservationRes.bookingId || '',
      purchaser_tax_code: dto.purchaserTaxCode || '',
      student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
      billing_scheme: isSubscription ? String(BillingScheme.SUBSCRIPTION) : String(BillingScheme.FULL),
    },
  }, {
    idempotencyKey: dto.idempotencyKey ? `stripe_sess_${dto.idempotencyKey}` : `stripe_sess_${reservationRes.bookingId}`,
  });

  return {
    success: true,
    url: session.url,
    bookingId: reservationRes.bookingId,
    booking: reservationRes.booking,
  };
}

export async function verifyPayment(
  supabase: SupabaseClient,
  params: VerifyPaymentParams,
  options?: { stripe?: Stripe }
) {
  const { sessionId, bookingId } = params;
  const stripe = options?.stripe || getStripeClient();

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const targetBookingId = bookingId || (session.metadata?.booking_id as string);
        if (targetBookingId) {
          const isSubscription = session.mode === 'subscription';
          const updatePayload: Record<string, any> = {
            payment_status: BookingPaymentStatus.PAID,
            payment_method: PaymentMethod.STRIPE,
          };
          if (session.customer) {
            updatePayload.stripe_customer_id = typeof session.customer === 'string' ? session.customer : session.customer.id;
          }
          if (session.subscription) {
            updatePayload.stripe_subscription_id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
            updatePayload.subscription_status = SubscriptionStatus.ACTIVE;
          }

          const { data: updatedBooking } = await supabase
            .from('bookings')
            .update(updatePayload)
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

export async function handleStripeWebhook(
  supabase: SupabaseClient,
  rawBody: string | Buffer,
  signature: string,
  webhookSecret?: string
) {
  const stripe = getStripeClient();
  const secret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Stripe webhook signature verification failed: ${msg}`);
  }

  if (event && event.id) {
    const { data: existingEvent } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent) {
      return { received: true, duplicate: true };
    }

    const { error: insertError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
      });

    if (insertError && (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique'))) {
      return { received: true, duplicate: true };
    }
  }

  // 1. Checkout Session Completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      const isSubscription = session.mode === 'subscription';
      const updateData: Record<string, any> = {
        payment_status: BookingPaymentStatus.PAID,
        payment_method: PaymentMethod.STRIPE,
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : (session.customer?.id || null),
        updated_at: new Date().toISOString(),
      };

      if (isSubscription && session.subscription) {
        updateData.stripe_subscription_id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        updateData.subscription_status = SubscriptionStatus.ACTIVE;
      }

      const { data: updatedBooking } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select('*')
        .single();

      if (updatedBooking) {
        // Record payment in ledger
        const totalPaid = Number(session.amount_total || 0) / 100;
        const regFee = Number(updatedBooking.registration_fee || 0);
        const coursePaid = Math.max(0, totalPaid - regFee);

        if (coursePaid > 0) {
          await supabase.from('payments').insert({
            booking_id: bookingId,
            user_id: updatedBooking.user_id || null,
            student_id: updatedBooking.student_id || null,
            amount: coursePaid,
            currency: PaymentCurrency.EUR,
            status: PaymentRecordStatus.SUCCEEDED,
            type: PaymentType.COURSE_PAYMENT,
            payment_method: PaymentMethod.STRIPE,
            provider: PaymentProvider.STRIPE,
            provider_transaction_id: session.payment_intent as string || null,
            academic_year: ACADEMIC_YEAR.CURRENT,
          });
        }

        if (regFee > 0) {
          const { data: feePayment } = await supabase.from('payments').insert({
            booking_id: bookingId,
            user_id: updatedBooking.user_id || null,
            student_id: updatedBooking.student_id || null,
            amount: regFee,
            currency: PaymentCurrency.EUR,
            status: PaymentRecordStatus.SUCCEEDED,
            type: PaymentType.REGISTRATION_FEE,
            payment_method: PaymentMethod.STRIPE,
            provider: PaymentProvider.STRIPE,
            provider_transaction_id: (session.payment_intent as string) || null,
            academic_year: ACADEMIC_YEAR.CURRENT,
          }).select('id').maybeSingle();

          const studentTaxCode = (updatedBooking.student_tax_code || updatedBooking.purchaser_tax_code || '').trim().toUpperCase();
          if (studentTaxCode) {
            const nextMembershipNumber = await generateNextMembershipNumber(supabase, ACADEMIC_YEAR.CURRENT);
            await supabase.from('annual_memberships').upsert(
              {
                tax_code: studentTaxCode,
                academic_year: ACADEMIC_YEAR.CURRENT,
                status: MembershipStatus.ACTIVE,
                membership_number: nextMembershipNumber,
                student_id: updatedBooking.student_id || null,
                user_id: updatedBooking.user_id || null,
                payment_id: feePayment?.id || null,
                amount: regFee,
                payment_method: PaymentMethod.STRIPE,
                paid_at: new Date().toISOString(),
                expires_at: ACADEMIC_YEAR.EXPIRY_DATE,
              },
              { onConflict: 'tax_code,academic_year' }
            );

            if (updatedBooking.student_id) {
              await supabase.from('students').update({
                annual_fee_paid: true,
                annual_fee_paid_at: new Date().toISOString(),
                status: 1,
              }).eq('id', updatedBooking.student_id);
            }
          }
        }

        // Send confirmation email
        const { data: course } = await supabase.from('courses').select('*').eq('id', updatedBooking.course_id).maybeSingle();
        sendBookingNotificationEmails({
          supabase,
          booking: updatedBooking,
          course: course || null,
          dto: {
            itemId: updatedBooking.course_id,
            firstName: updatedBooking.purchaser_name?.split(' ')[0] || '',
            lastName: updatedBooking.purchaser_name?.split(' ').slice(1).join(' ') || '',
            email: updatedBooking.purchaser_email || '',
            phone: updatedBooking.purchaser_phone || undefined,
            studentFirstName: updatedBooking.student_name?.split(' ')[0] || '',
            studentLastName: updatedBooking.student_name?.split(' ').slice(1).join(' ') || '',
            studentEmail: updatedBooking.student_email || undefined,
            studentTaxCode: updatedBooking.student_tax_code || undefined,
          },
        }).catch((err) => console.warn('Async webhook confirmation email warning:', err));

        sendBookingNotificationTelegram({
          supabase,
          booking: updatedBooking,
          course: course || null,
          dto: {
            itemId: updatedBooking.course_id,
            firstName: updatedBooking.purchaser_name?.split(' ')[0] || '',
            lastName: updatedBooking.purchaser_name?.split(' ').slice(1).join(' ') || '',
            email: updatedBooking.purchaser_email || '',
            phone: updatedBooking.purchaser_phone || undefined,
            studentFirstName: updatedBooking.student_name?.split(' ')[0] || '',
            studentLastName: updatedBooking.student_name?.split(' ').slice(1).join(' ') || '',
            studentEmail: updatedBooking.student_email || undefined,
            studentTaxCode: updatedBooking.student_tax_code || undefined,
          },
        }).catch((err) => console.warn('Async webhook telegram notification warning:', err));
      }
    }
  }


  // 2. Invoice Paid (Subscription Monthly Renewal)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string;

    if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      if (booking) {
        const { data: course } = await supabase.from('courses').select('*').eq('id', booking.course_id).maybeSingle();

        const currentPeriodEnd = booking.subscription_ends_at ? new Date(booking.subscription_ends_at) : new Date();
        const nextPeriodStart = currentPeriodEnd.toISOString();
        const nextPeriodEndDate = new Date(currentPeriodEnd);
        nextPeriodEndDate.setMonth(nextPeriodEndDate.getMonth() + 1);
        const nextPeriodEnd = nextPeriodEndDate.toISOString();

        // Calculate next month's lesson batch
        const nextLessons = calculateLessonDates(
          nextPeriodStart,
          booking.start_time || '10:00',
          course?.category || undefined,
          booking.schedule_days || course?.schedule_days || null,
          course?.lesson_duration_minutes || 60,
          course?.start_time || booking.start_time || null,
          course?.end_time || null,
          course?.schedule_type || null
        );

        if (nextLessons && nextLessons.length > 0) {
          await generateAndSaveLessons(booking.id, course, nextLessons, supabase);
        }

        // Record renewal payment in ledger
        const renewalAmount = Number(invoice.amount_paid || 0) / 100;
        await supabase.from('payments').insert({
          booking_id: booking.id,
          user_id: booking.user_id || null,
          student_id: booking.student_id || null,
          amount: renewalAmount,
          currency: PaymentCurrency.EUR,
          status: PaymentRecordStatus.SUCCEEDED,
          type: PaymentType.COURSE_PAYMENT,
          payment_method: PaymentMethod.STRIPE,
          provider: PaymentProvider.STRIPE,
          academic_year: ACADEMIC_YEAR.CURRENT,
        });

        // Update booking subscription status and period
        await supabase.from('bookings').update({
          subscription_ends_at: nextPeriodEnd,
          subscription_status: SubscriptionStatus.ACTIVE,
          updated_at: new Date().toISOString(),
        }).eq('id', booking.id);
      }
    }
  }

  // 3. Customer Subscription Updated (Cancellation / Status change)
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as any;
    let subStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    if (sub.status === 'past_due') subStatus = SubscriptionStatus.PAST_DUE;
    else if (sub.status === 'canceled' || sub.status === 'unpaid') subStatus = SubscriptionStatus.CANCELED;
    else if (sub.status === 'paused') subStatus = SubscriptionStatus.PAUSED;

    await supabase.from('bookings').update({
      cancel_at_period_end: sub.cancel_at_period_end,
      subscription_status: subStatus,
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', sub.id);
  }

  // 4. Customer Subscription Deleted
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any;
    await supabase.from('bookings').update({
      subscription_status: SubscriptionStatus.CANCELED,
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', sub.id);
  }

  return { received: true };
}
