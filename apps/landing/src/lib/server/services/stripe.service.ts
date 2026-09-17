import Stripe from 'stripe';
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
} from '@atena/api-types';
import { calculateLessonDates } from '@atena/utils';
import { getSupabaseAdmin } from '../supabase-admin';
import { CreateReservationParams, VerifyPaymentParams } from './types';
import { createReservation, generateAndSaveLessons } from './reservation.service';

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(secretKey, { apiVersion: '2023-10-16' as Stripe.StripeConfig['apiVersion'] });
}

export async function getSystemSettings(): Promise<{ stripeEnabled: boolean; subscriptionsEnabled: boolean }> {
  let stripeEnabled = false;
  let subscriptionsEnabled = false;

  try {
    const supabase = getSupabaseAdmin();
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

  // Fallback to environment variables if not defined
  if (!stripeEnabled) {
    stripeEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true' || process.env.ENABLE_STRIPE === 'true';
  }
  if (!subscriptionsEnabled) {
    subscriptionsEnabled = process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true' || process.env.ENABLE_SUBSCRIPTIONS === 'true';
  }

  return { stripeEnabled, subscriptionsEnabled };
}

export async function updateSystemSettings(settings: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }): Promise<{ stripeEnabled: boolean; subscriptionsEnabled: boolean }> {
  const supabase = getSupabaseAdmin();
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
  return await getSystemSettings();
}

export async function createCustomerPortalSession(params: { customerId: string; returnUrl?: string }) {
  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl || `${siteUrl}/checkout`,
  });
  return { success: true, url: session.url };
}

export async function createStripeSession(dto: CreateReservationParams) {
  const settings = await getSystemSettings();
  if (!settings.stripeEnabled) {
    throw new Error('Online payments are temporarily disabled. Please choose the pay on-site reservation option.');
  }

  const isSubscription = Number(dto.billingScheme) === BillingScheme.SUBSCRIPTION;
  if (isSubscription && !settings.subscriptionsEnabled) {
    throw new Error('Monthly subscriptions are currently disabled.');
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

  // Multi-student payload
  if (dto.students && dto.students.length > 0) {
    const reservationRes = await createReservation({
      ...dto,
      paymentMethod: PaymentMethod.STRIPE,
      paymentStatus: BookingPaymentStatus.PENDING,
      billingScheme: isSubscription ? BillingScheme.SUBSCRIPTION : BillingScheme.FULL,
    });

    const { data: course } = await supabase.from('courses').select('*').eq('id', resolvedItemId).maybeSingle();
    const courseName = course?.name || course?.title_it || 'Corso Atena School';
    const coursePrice = isSubscription
      ? (course?.subscription_price != null ? Number(course.subscription_price) : (Number(course?.price) || 73.2))
      : (course ? Number(course.price) : 73.2);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const b of reservationRes.bookings) {
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
                name: `${courseName} — Abbonamento Mensile (${b.student_name})`,
              },
              unit_amount: Math.round(coursePrice * 100),
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          });
        }
      } else {
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
      }

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
      mode: isSubscription ? 'subscription' : 'payment',
      customer_email: dto.email,
      success_url: `${siteUrl}/checkout/success/${reservationRes.bookingId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
      metadata: {
        booking_id: reservationRes.bookingId,
        booking_ids: reservationRes.bookingIds.join(','),
        purchaser_tax_code: dto.purchaserTaxCode || '',
        billing_scheme: isSubscription ? String(BillingScheme.SUBSCRIPTION) : String(BillingScheme.FULL),
      },
    }, {
      idempotencyKey: dto.idempotencyKey ? `stripe_sess_${dto.idempotencyKey}` : `stripe_sess_${reservationRes.bookingId}`,
    });

    return { success: true, url: session.url, bookingId: reservationRes.bookingId };
  }

  // 1. Primary: If not subscription and single student, invoke Supabase Edge Function 'create-checkout-session' if available
  if (!isSubscription) {
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
  }

  // 2. Direct Stripe SDK session creation (Supports both One-time and Subscription)
  const reservationRes = await createReservation({
    ...dto,
    paymentMethod: PaymentMethod.STRIPE,
    paymentStatus: BookingPaymentStatus.PENDING,
    billingScheme: isSubscription ? BillingScheme.SUBSCRIPTION : BillingScheme.FULL,
  });

  const booking = reservationRes.booking;
  const { data: course } = await supabase.from('courses').select('*').eq('id', resolvedItemId).maybeSingle();
  const courseName = course?.name || course?.title_it || booking.course_name || 'Corso Atena School';
  const coursePrice = isSubscription
    ? (course?.subscription_price != null ? Number(course.subscription_price) : (Number(course?.price) || 73.2))
    : Number(booking.amount_paid) - Number(booking.registration_fee || 0);
  const regFee = Number(booking.registration_fee || 0);

  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

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
            name: `${courseName} — Abbonamento Mensile`,
          },
          unit_amount: Math.round(coursePrice * 100),
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      });
    }
  } else {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: courseName,
        },
        unit_amount: Math.round(coursePrice * 100),
      },
      quantity: 1,
    });
  }

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
    mode: isSubscription ? 'subscription' : 'payment',
    customer_email: dto.email,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
    metadata: {
      booking_id: booking.id,
      purchaser_tax_code: dto.purchaserTaxCode || '',
      student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
      billing_scheme: isSubscription ? String(BillingScheme.SUBSCRIPTION) : String(BillingScheme.FULL),
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

  // 1. Checkout Session Completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingIdsStr = session.metadata?.booking_ids || session.metadata?.booking_id;
    if (bookingIdsStr) {
      const ids = bookingIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
      for (const bId of ids) {
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

  // 2. Subscription Renewal Payment Succeeded (invoice.payment_succeeded)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any;
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    
    if (subscriptionId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      if (booking) {
        const { data: course } = await supabase
          .from('courses')
          .select('*')
          .eq('id', booking.course_id)
          .maybeSingle();

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
          amount: renewalAmount,
          currency: PaymentCurrency.EUR,
          status: PaymentRecordStatus.SUCCEEDED,
          type: PaymentType.COURSE_PAYMENT,
          payment_method: PaymentMethod.STRIPE,
          provider: PaymentProvider.STRIPE,
          academic_year: '2026/2027',
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

  if (event && event.id) {
    await supabase.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });
  }

  return { received: true };
}
