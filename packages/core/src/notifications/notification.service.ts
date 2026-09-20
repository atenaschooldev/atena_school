import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingPaymentStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationTemplateRecord,
} from '@atena/api-types';
import { formatCourseScheduleText } from '@atena/utils';
import {
  BookingEmailTemplateData,
  ContactEmailTemplateData,
  renderClientBookingConfirmationEmail,
  renderAdminBookingNotificationEmail,
  renderContactFormAdminEmail,
} from './email-templates';
import type { SupabaseBookingRow, SupabaseCourseRow, CreateReservationParams } from '../types';

export function compileTemplate(
  template: string,
  variables: Record<string, any>
): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    const val = variables[key];
    if (val === undefined || val === null) {
      return '';
    }
    return String(val);
  });
}

export async function getNotificationTemplateByCode(
  supabase: SupabaseClient,
  code: string
): Promise<NotificationTemplateRecord | null> {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data as NotificationTemplateRecord;
  } catch {
    return null;
  }
}

export interface NotificationLogData {
  channel: NotificationChannel;
  type: NotificationType;
  recipient: string;
  subject?: string | null;
  status: NotificationStatus;
  userId?: string | null;
  bookingId?: string | null;
  payload?: any;
  error?: string | null;
  provider?: string | null;
  messageId?: string | null;
}

export async function logNotification(
  supabase: SupabaseClient,
  data: NotificationLogData
): Promise<void> {
  try {
    await supabase.from('notification_logs').insert({
      channel: data.channel,
      notification_type: data.type,
      recipient: data.recipient,
      subject: data.subject || null,
      request: {
        payload: data.payload || null,
        userId: data.userId || null,
        bookingId: data.bookingId || null,
        provider: data.provider || null,
      },
      response: {
        error: data.error || null,
        messageId: data.messageId || null,
      },
      status: data.status,
    });
  } catch (err) {
    console.warn('Failed to log notification:', err);
  }
}

import { getSchoolProfile } from '../system/school-profile.service';

export interface EmailServiceConfig {
  resendApiKey?: string;
  fromEmail?: string;
  adminEmail?: string;
  appUrl?: string;
}

export async function sendEmailViaResend(options: {
  apiKey?: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = options.apiKey || process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Status ${res.status}: ${errText}` };
    }

    const json = (await res.json()) as { id?: string };
    return { success: true, messageId: json.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function sendBookingNotificationEmails(params: {
  supabase: SupabaseClient;
  booking: SupabaseBookingRow;
  course: SupabaseCourseRow | null;
  dto: CreateReservationParams;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, booking, course, dto, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const courseName = course?.name || course?.title_it || `Corso ${schoolProfile.name}`;
  const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
    : purchaserName;
  const adminEmail = config?.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || process.env.SCHOOL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@atenaschool.com';
  const fromEmail = config?.fromEmail || process.env.RESEND_FROM_EMAIL || `${schoolProfile.name} <${schoolProfile.email || 'info@atenaschool.com'}>`;
  const appUrl = config?.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://atena-school-app.vercel.app';
  const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;

  const isPaidOnline = Number(booking.payment_status) === BookingPaymentStatus.PAID;
  const paymentStatusText = isPaidOnline ? 'Pagato Online con Carta (Stripe)' : 'Prenotato con Saldo in Sede';
  const totalEur = Number(booking.amount_paid || 0).toFixed(2);
  const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
  const courseFeeEur = (Number(totalEur) - Number(regFeeEur)).toFixed(2);
  const stripePaymentIntentId = (booking as any).stripe_payment_intent_id || (booking as any).payment_intent_id || undefined;
  const stripeSessionId = (booking as any).stripe_session_id || undefined;

  const bookingRecord = booking as Record<string, any>;
  const scheduleDays = bookingRecord.schedule_days || course?.schedule_days || null;
  const startTime = bookingRecord.start_time || course?.start_time || dto.time || null;
  const endTime = bookingRecord.end_time || course?.end_time || null;
  let lessonSchedule = formatCourseScheduleText(scheduleDays, startTime, endTime);
  if (lessonSchedule === 'Da concordare') {
    if (dto.time && dto.time.trim() !== '') {
      lessonSchedule = dto.time;
    } else if (course?.schedule_type === 'flexible' || Number(course?.schedule_type) === 2) {
      lessonSchedule = 'Orario Flessibile (Concordato)';
    } else if (startTime) {
      lessonSchedule = startTime;
    }
  }

  const templateData: BookingEmailTemplateData = {
    courseName,
    purchaserName,
    studentName,
    purchaserEmail: dto.email,
    purchaserPhone: dto.phone,
    purchaserTaxCode: dto.purchaserTaxCode,
    birthPlace: dto.birthPlace,
    isForChild: dto.isForChild,
    studentEmail: dto.studentEmail,
    studentPhone: dto.studentPhone,
    studentTaxCode: dto.studentTaxCode,
    studentBirthDate: dto.studentBirthDate,
    studentBirthPlace: dto.studentBirthPlace || dto.birthPlace || undefined,
    promoCode: dto.promoCode || booking.promo_code || undefined,
    discountAmount: booking.discount_amount ? String(booking.discount_amount) : undefined,
    date: dto.date,
    time: dto.time,
    lessonSchedule,
    totalEur,
    courseFeeEur,
    regFeeEur,
    isPaidOnline,
    paymentStatusText,
    paymentMethodText: String(booking.payment_method || '1'),
    bookingId: booking.id,
    notes: dto.notes,
    appUrl,
    schoolProfile,
    pecEmail: dto.pecEmail,
    sdiCode: dto.sdiCode,
    needsCompanyInvoice: dto.needsCompanyInvoice,
    stripeSessionId,
    stripePaymentIntentId,
    stripeDashboardUrl: stripePaymentIntentId
      ? `https://dashboard.stripe.com/payments/${stripePaymentIntentId}`
      : undefined,
    createdAtFormatted: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
  };

  // 1. Client Confirmation Email
  if (dto.email) {
    const clientRendered = renderClientBookingConfirmationEmail(templateData);

    const clientRes = await sendEmailViaResend({
      apiKey,
      from: fromEmail,
      to: dto.email,
      subject: clientRendered.subject,
      html: clientRendered.html,
    });

    await logNotification(supabase, {
      channel: NotificationChannel.EMAIL,
      type: NotificationType.BOOKING_CONFIRMATION,
      recipient: dto.email,
      subject: clientRendered.subject,
      status: clientRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      bookingId: booking.id,
      provider: 'resend',
      messageId: clientRes.messageId || null,
      error: clientRes.error || null,
      payload: { courseName, totalEur, isPaidOnline },
    });
  }

  // 2. Admin Notification Email
  if (adminEmail) {
    const adminRendered = renderAdminBookingNotificationEmail(templateData);

    const adminRes = await sendEmailViaResend({
      apiKey,
      from: fromEmail,
      to: adminEmail,
      subject: adminRendered.subject,
      html: adminRendered.html,
    });

    await logNotification(supabase, {
      channel: NotificationChannel.EMAIL,
      type: NotificationType.BOOKING_CONFIRMATION,
      recipient: adminEmail,
      subject: adminRendered.subject,
      status: adminRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      bookingId: booking.id,
      provider: 'resend',
      messageId: adminRes.messageId || null,
      error: adminRes.error || null,
      payload: { courseName, studentName, totalEur },
    });
  }
}

export async function sendContactFormNotificationEmail(params: {
  supabase: SupabaseClient;
  data: ContactEmailTemplateData;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, data, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const adminEmail = config?.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || process.env.SCHOOL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@atenaschool.com';
  const fromEmail = config?.fromEmail || process.env.RESEND_FROM_EMAIL || `${schoolProfile.name} <${schoolProfile.email || 'info@atenaschool.com'}>`;
  const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;

  data.schoolProfile = schoolProfile;
  const senderName = `${data.firstName} ${data.lastName}`.trim();
  const contactRendered = renderContactFormAdminEmail(data);

  const res = await sendEmailViaResend({
    apiKey,
    from: fromEmail,
    to: adminEmail,
    subject: contactRendered.subject,
    html: contactRendered.html,
  });

  await logNotification(supabase, {
    channel: NotificationChannel.EMAIL,
    type: NotificationType.CONTACT_FORM,
    recipient: adminEmail,
    subject: contactRendered.subject,
    status: res.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
    provider: 'resend',
    messageId: res.messageId || null,
    error: res.error || null,
    payload: { senderName, email: data.email, message: data.message },
  });
}

export async function sendTelegramMessage(params: {
  supabase?: SupabaseClient;
  botToken?: string;
  chatId?: string;
  text: string;
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  bookingId?: string | null;
  notificationType?: NotificationType;
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = params.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = params.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, error: 'Telegram BOT_TOKEN or CHAT_ID not configured' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body: Record<string, any> = {
      chat_id: chat,
      text: params.text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (params.inlineKeyboard && params.inlineKeyboard.length > 0) {
      body.reply_markup = { inline_keyboard: params.inlineKeyboard };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };

    if (!res.ok || !json.ok) {
      const errStr = json.description || `HTTP error ${res.status}`;
      if (params.supabase) {
        await logNotification(params.supabase, {
          channel: NotificationChannel.TELEGRAM,
          type: params.notificationType || NotificationType.BOOKING_CONFIRMATION,
          recipient: chat,
          status: NotificationStatus.FAILED,
          bookingId: params.bookingId || null,
          provider: 'telegram',
          error: errStr,
          payload: { text: params.text },
        });
      }
      return { success: false, error: errStr };
    }

    const msgId = json.result?.message_id;
    if (params.supabase) {
      await logNotification(params.supabase, {
        channel: NotificationChannel.TELEGRAM,
        type: params.notificationType || NotificationType.BOOKING_CONFIRMATION,
        recipient: chat,
        status: NotificationStatus.SENT,
        bookingId: params.bookingId || null,
        provider: 'telegram',
        messageId: msgId ? String(msgId) : null,
        payload: { text: params.text },
      });
    }

    return { success: true, messageId: msgId };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

