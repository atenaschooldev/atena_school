import {
  BookingEmailTemplateData,
  renderClientBookingConfirmationEmail,
  renderAdminBookingNotificationEmail,
} from './email-templates';
import type { SupabaseBookingRow, SupabaseCourseRow, CreateReservationParams } from './checkout-service';
import { BookingPaymentStatus } from '@atena/api-types';

export interface SendBookingEmailsParams {
  booking: SupabaseBookingRow;
  course: SupabaseCourseRow | null;
  dto: CreateReservationParams;
}

export async function sendBookingNotificationEmails(params: SendBookingEmailsParams): Promise<void> {
  const { booking, course, dto } = params;
  const courseName = course?.name || course?.title_it || 'Corso Atena School';
  const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
    : purchaserName;
  const adminEmail = process.env.SCHOOL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'atenaschool20@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Atena School <onboarding@resend.dev>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atena-school-app.vercel.app';

  const isPaidOnline = Number(booking.payment_status) === BookingPaymentStatus.PAID;
  const paymentStatusText = isPaidOnline ? 'Pagato Online con Carta (Stripe)' : 'Prenotato con Saldo in Sede';
  const totalEur = Number(booking.amount_paid || 0).toFixed(2);
  const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
  const courseFeeEur = (Number(totalEur) - Number(regFeeEur)).toFixed(2);
  const stripePaymentIntentId = (booking as unknown as { stripe_payment_intent_id?: string; payment_intent_id?: string }).stripe_payment_intent_id || (booking as unknown as { payment_intent_id?: string }).payment_intent_id || undefined;
  const stripeSessionId = (booking as unknown as { stripe_session_id?: string }).stripe_session_id || undefined;

  const templateData: BookingEmailTemplateData = {
    courseName,
    purchaserName,
    studentName,
    purchaserEmail: dto.email,
    purchaserPhone: dto.phone,
    purchaserTaxCode: dto.purchaserTaxCode,
    isForChild: dto.isForChild,
    studentTaxCode: dto.studentTaxCode,
    studentBirthDate: dto.studentBirthDate,
    date: dto.date,
    time: dto.time,
    lessonSchedule: dto.time || undefined,
    totalEur,
    courseFeeEur,
    regFeeEur,
    isPaidOnline,
    paymentStatusText,
    paymentMethodText: isPaidOnline ? 'Carta di Credito (Stripe)' : 'Contanti / POS in Segreteria',
    bookingId: booking.id,
    notes: dto.notes,
    appUrl,
    pecEmail: dto.pecEmail,
    sdiCode: dto.sdiCode,
    needsCompanyInvoice: dto.needsCompanyInvoice,
    stripeSessionId,
    stripePaymentIntentId,
    stripeDashboardUrl: stripePaymentIntentId ? `https://dashboard.stripe.com/payments/${stripePaymentIntentId}` : undefined,
  };

  const clientEmail = renderClientBookingConfirmationEmail(templateData);
  const adminNotification = renderAdminBookingNotificationEmail(templateData);

  if (!resendApiKey) {
    console.log(`[EMAIL DISPATCH SKIPPED - NO RESEND API KEY]: Booking ${booking.id} for ${dto.email} -> ${adminEmail}`);
    return;
  }

  const sendWithTimeout = async (to: string, subject: string, html: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[EMAIL ERROR] Failed to send email to ${to}: status ${response.status} - ${errorText}`);
        return { success: false, error: errorText };
      }

      const resData = await response.json().catch(() => ({}));
      console.log(`[EMAIL SUCCESS] Sent email to ${to} for booking ${booking.id} (Resend ID: ${resData.id || 'ok'})`);
      return { success: true, id: resData.id };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as Error)?.name === 'AbortError';
      console.error(`[EMAIL DISPATCH ERROR] ${isAbort ? 'Timeout after 5000ms' : 'Network/API error'} sending to ${to}:`, err);
      return { success: false, error: err };
    }
  };

  try {
    const results = await Promise.allSettled([
      sendWithTimeout(dto.email, clientEmail.subject, clientEmail.html),
      sendWithTimeout(adminEmail, adminNotification.subject, adminNotification.html),
    ]);

    console.log(`[EMAIL DISPATCH FINISHED] Booking ${booking.id}: client=${results[0].status}, admin=${results[1].status}`);
  } catch (err) {
    console.error('[EMAIL DISPATCH UNEXPECTED ERROR]:', err);
  }

  // Asynchronously send Telegram notification to school admin/team
  import('./telegram-service').then(({ sendTelegramBookingNotification }) => {
    sendTelegramBookingNotification(templateData).catch((err) =>
      console.warn('Async Telegram booking notification error:', err)
    );
  });
}

export async function sendContactFormNotificationEmail(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
}): Promise<void> {
  const { renderContactFormAdminEmail } = await import('./email-templates');
  const adminEmail = process.env.SCHOOL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'atenaschool20@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Atena School <onboarding@resend.dev>';

  // Send Telegram notification regardless of Resend key status
  import('./telegram-service').then(({ sendTelegramContactNotification }) => {
    sendTelegramContactNotification(params).catch((err) =>
      console.warn('Async Telegram contact notification error:', err)
    );
  });

  const emailData = renderContactFormAdminEmail(params);

  if (!resendApiKey) {
    console.log(`[CONTACT EMAIL SKIPPED - NO RESEND API KEY]: From ${params.email} -> ${adminEmail}`);
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: params.email,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (response.ok) {
      console.log(`[CONTACT EMAIL SUCCESS] Sent contact form notification to admin (${adminEmail})`);
    } else {
      const err = await response.text().catch(() => '');
      console.error(`[CONTACT EMAIL ERROR] Status ${response.status}:`, err);
    }
  } catch (err) {
    console.error('[CONTACT EMAIL NETWORK ERROR]:', err);
  }
}


