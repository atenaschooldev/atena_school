import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingPaymentStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationTemplateRecord,
  RecipientType,
  TriggerTimingType,
  parseTriggerTimingType,
} from '@atena/api-types';
import { formatCourseScheduleText } from '@atena/utils';
import {
  BookingEmailTemplateData,
  ContactEmailTemplateData,
  renderClientBookingConfirmationEmail,
  renderAdminBookingNotificationEmail,
  renderContactFormAdminEmail,
} from './email-templates';
import { renderEmailFromBlocks, getDefaultBlocksForTemplate, renderTelegramFromBlocks } from './block-compiler';
import type { SupabaseBookingRow, SupabaseCourseRow, CreateReservationParams } from '../types';

import { getFieldValue } from './trigger-matcher';

export function compileTemplate(
  template: string,
  variables: Record<string, any>
): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_match, key) => {
    const val = getFieldValue(variables, key);
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
  notificationTriggerId?: string | null;
  notificationTemplateId?: string | null;
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
      notification_trigger_id: data.notificationTriggerId || null,
      notification_template_id: data.notificationTemplateId || null,
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
import {
  getResendCredentials,
  getTelegramCredentials,
  getDomainsCredentials,
} from '../system/integration-secrets.service';

export interface EmailServiceConfig {
  resendApiKey?: string;
  fromEmail?: string;
  adminEmail?: string;
  appUrl?: string;
}

/**
 * Utility for exponential backoff retries on transient network and HTTP 429/5xx errors
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelayMs = 350
): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, options);
      // Retry only on rate limits (429) or transient server errors (500, 502, 503, 504)
      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        attempt++;
        const jitter = Math.floor(Math.random() * 100);
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < maxRetries) {
        attempt++;
        const jitter = Math.floor(Math.random() * 100);
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
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
    const res = await fetchWithRetry('https://api.resend.com/emails', {
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

export async function sendTelegramMessage(params: {
  supabase?: SupabaseClient;
  text: string;
  botToken?: string;
  chatId?: string;
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  bookingId?: string | null;
  notificationType?: NotificationType;
  notificationTriggerId?: string | null;
  notificationTemplateId?: string | null;
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const {
    supabase,
    text,
    botToken,
    chatId,
    inlineKeyboard,
    bookingId,
    notificationType,
    notificationTriggerId,
    notificationTemplateId,
  } = params;
  let token = botToken;
  let chat = chatId;

  if (!token || !chat) {
    try {
      const tgCreds = await getTelegramCredentials(supabase);
      token = token || tgCreds.botToken;
      chat = chat || tgCreds.chatId;
    } catch {
      // ignore
    }
  }

  token = token || process.env.TELEGRAM_BOT_TOKEN;
  chat = chat || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, error: 'Telegram BOT_TOKEN or CHAT_ID not configured' };
  }

  try {
    const body: Record<string, any> = {
      chat_id: chat,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      body.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    const res = await fetchWithRetry(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (supabase) {
        await logNotification(supabase, {
          channel: NotificationChannel.TELEGRAM,
          type: (notificationType || NotificationType.BOOKING_CONFIRMATION) as NotificationType,
          recipient: chat,
          subject: 'Telegram Notification',
          status: NotificationStatus.FAILED,
          notificationTriggerId: notificationTriggerId || null,
          notificationTemplateId: notificationTemplateId || null,
          bookingId: bookingId || null,
          error: errText,
          provider: 'telegram',
        });
      }
      return { success: false, error: `Telegram status ${res.status}: ${errText}` };
    }

    const json = (await res.json()) as { ok?: boolean; result?: { message_id?: number } };
    const messageId = json.result?.message_id;

    if (supabase) {
      await logNotification(supabase, {
        channel: NotificationChannel.TELEGRAM,
        type: (notificationType || NotificationType.BOOKING_CONFIRMATION) as NotificationType,
        recipient: chat,
        subject: 'Telegram Notification',
        status: NotificationStatus.SENT,
        notificationTriggerId: notificationTriggerId || null,
        notificationTemplateId: notificationTemplateId || null,
        bookingId: bookingId || null,
        messageId: messageId ? String(messageId) : undefined,
        provider: 'telegram',
      });
    }

    return { success: true, messageId };
  } catch (err: any) {
    if (supabase) {
      await logNotification(supabase, {
        channel: NotificationChannel.TELEGRAM,
        type: (notificationType || NotificationType.BOOKING_CONFIRMATION) as NotificationType,
        recipient: chat,
        subject: 'Telegram Notification',
        status: NotificationStatus.FAILED,
        notificationTriggerId: notificationTriggerId || null,
        notificationTemplateId: notificationTemplateId || null,
        bookingId: bookingId || null,
        error: err?.message || 'Network error',
        provider: 'telegram',
      });
    }
    return { success: false, error: err?.message || 'Network error' };
  }
}

import { buildBookingTelegramKeyboard } from './telegram-actions.service';

export async function sendBookingNotificationEmails(params: {
  supabase: SupabaseClient;
  booking: SupabaseBookingRow;
  course: SupabaseCourseRow | null;
  dto: CreateReservationParams;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, booking, course, dto, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const domainsCreds = await getDomainsCredentials(supabase);
  const courseName = course?.name || course?.title_it || `Corso ${schoolProfile.name}`;
  const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
    : purchaserName;
  const appUrl = config?.appUrl || domainsCreds.appUrl || schoolProfile.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://app.atenaschool.com';
  const adminUrl = domainsCreds.adminUrl || schoolProfile.admin_url || process.env.NEXT_PUBLIC_ADMIN_URL || 'https://atena-school-admin.vercel.app';

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

  const customFields = (booking as any).custom_fields || dto.custom_fields || {};

  // Common dynamic variables dictionary for template engine
  const templateVariables: Record<string, any> = {
    ...customFields,
    custom_fields: customFields,
    customFields,
    course_name: courseName,
    courseName,
    purchaser_name: purchaserName,
    purchaserName,
    student_name: studentName,
    studentName,
    purchaser_email: dto.email,
    purchaserEmail: dto.email,
    email: dto.email,
    purchaser_phone: dto.phone || '',
    purchaserPhone: dto.phone || '',
    phone: dto.phone || '',
    purchaser_tax_code: dto.purchaserTaxCode || '',
    purchaserTaxCode: dto.purchaserTaxCode || '',
    birth_place: dto.birthPlace || '',
    birthPlace: dto.birthPlace || '',
    student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
    studentTaxCode: dto.studentTaxCode || dto.purchaserTaxCode || '',
    student_birth_date: dto.studentBirthDate || '',
    studentBirthDate: dto.studentBirthDate || '',
    student_birth_place: dto.studentBirthPlace || dto.birthPlace || '',
    studentBirthPlace: dto.studentBirthPlace || dto.birthPlace || '',
    student_email: dto.studentEmail || '',
    studentEmail: dto.studentEmail || '',
    student_phone: dto.studentPhone || '',
    studentPhone: dto.studentPhone || '',
    is_for_child: dto.isForChild,
    isForChild: dto.isForChild,
    promo_code: dto.promoCode || booking.promo_code || '',
    promoCode: dto.promoCode || booking.promo_code || '',
    discount_amount: booking.discount_amount ? String(booking.discount_amount) : '0.00',
    discountAmount: booking.discount_amount ? String(booking.discount_amount) : '0.00',
    date: dto.date || '',
    start_date: dto.date || '',
    time: dto.time || '',
    lesson_schedule: lessonSchedule,
    lessonSchedule,
    schedule_text: lessonSchedule,
    total_amount: totalEur,
    totalEur,
    amount_paid: totalEur,
    course_price: courseFeeEur,
    courseFeeEur,
    registration_fee: regFeeEur,
    regFeeEur,
    is_paid_online: isPaidOnline,
    isPaidOnline,
    payment_status: paymentStatusText,
    paymentStatusText,
    payment_status_label: isPaidOnline ? '✓ Pagato Online (Stripe)' : '⏳ Saldo in Sede',
    payment_method: String(booking.payment_method || '1'),
    payment_method_label: isPaidOnline ? 'Carta di Credito (Stripe)' : 'Saldo in Sede / Contanti',
    booking_id: booking.id,
    bookingId: booking.id,
    notes: dto.notes || '',
    app_url: appUrl,
    appUrl,
    dashboard_url: appUrl,
    admin_url: adminUrl,
    adminUrl,
    pec_email: dto.pecEmail || '',
    sdi_code: dto.sdiCode || '',
    stripe_payment_intent_id: stripePaymentIntentId,
    stripe_session_id: stripeSessionId,
  };

  // Dispatch via Unified Trigger Engine (DB Triggers + SYSTEM_TRIGGERS Fallback)
  await processNotificationTriggers(
    supabase,
    isPaidOnline ? 'booking.created_stripe' : 'booking.pending_cash',
    templateVariables,
    config
  );
}

export async function sendContactFormNotificationEmail(params: {
  supabase: SupabaseClient;
  data: ContactEmailTemplateData;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, data, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const domainsCreds = await getDomainsCredentials(supabase);

  data.schoolProfile = schoolProfile;
  const senderName = `${data.firstName} ${data.lastName}`.trim();

  const customFields = data.custom_fields || (data as any).customFields || {};

  const leadVariables: Record<string, any> = {
    ...customFields,
    custom_fields: customFields,
    customFields,
    sender_name: senderName,
    senderName,
    sender_email: data.email,
    senderEmail: data.email,
    email: data.email,
    sender_phone: data.phone || '',
    senderPhone: data.phone || '',
    phone: data.phone || '',
    interest: data.interest || 'Informazioni Generali',
    topic: data.topic || data.interest || 'Richiesta Contatto',
    message: data.message,
    message_body: data.message,
    messageBody: data.message,
    admin_url: domainsCreds.adminUrl || schoolProfile.admin_url || process.env.NEXT_PUBLIC_ADMIN_URL || 'https://atena-school-admin.vercel.app',
  };

  // Dispatch via Unified Trigger Engine (DB Triggers + SYSTEM_TRIGGERS Fallback)
  await processNotificationTriggers(
    supabase,
    'contact_form.submitted',
    leadVariables,
    config
  );
}

import { SYSTEM_TRIGGERS, SystemTriggerDefinition } from './system-triggers.config';

/**
 * Universal Event-Driven Trigger Processor for Vercel Server Actions & Next.js
 * Supports dynamic rules from database with zero-breaking fallback to declarative SYSTEM_TRIGGERS.
 */
export async function processNotificationTriggers(
  supabase: SupabaseClient,
  eventKey: string,
  payload: Record<string, any>,
  config?: EmailServiceConfig
): Promise<void> {
  try {
    let activeTriggers: Array<{
      id: string;
      name: string;
      description?: string | null;
      event_key: string;
      notification_template_id?: string;
      template_code?: string;
      template?: NotificationTemplateRecord | null;
      channel: NotificationChannel;
      recipient_type: number;
      custom_recipient?: string | null;
      conditions?: Record<string, any> | null;
      timing_type?: TriggerTimingType | number;
      delay_seconds?: number;
      is_active: boolean;
    }> = [];

    // 1. Try to load dynamic triggers from database
    try {
      const { data: dbTriggers, error: dbErr } = await supabase
        .from('notification_triggers')
        .select('*, template:notification_templates(*)')
        .eq('event_key', eventKey)
        .eq('is_active', true);

      if (!dbErr && dbTriggers && dbTriggers.length > 0) {
        activeTriggers = dbTriggers.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          event_key: r.event_key,
          notification_template_id: r.notification_template_id || r.template_id,
          template_code: r.template?.code,
          template: r.template || null,
          channel: (Number(r.channel) || NotificationChannel.EMAIL) as NotificationChannel,
          recipient_type: (Number(r.recipient_type) || RecipientType.CUSTOMER) as RecipientType,
          custom_recipient: r.custom_recipient || null,
          conditions: r.conditions || null,
          timing_type: parseTriggerTimingType(r.timing_type),
          delay_seconds: r.delay_seconds || 0,
          is_active: r.is_active,
        }));
      }
    } catch {
      // DB table might not exist in dev or network error -> fallback to SYSTEM_TRIGGERS
    }

    // 2. Safe Fallback to declarative SYSTEM_TRIGGERS
    if (activeTriggers.length === 0) {
      activeTriggers = SYSTEM_TRIGGERS.filter(
        (t) => t.event_key === eventKey && t.is_active
      ).map((t) => ({ ...t, template: null }));
    }

    if (activeTriggers.length === 0) {
      return;
    }

    const schoolProfile = await getSchoolProfile(supabase);
    const resendCreds = await getResendCredentials(supabase);
    const apiKey = config?.resendApiKey || resendCreds.apiKey;
    const fromEmail = config?.fromEmail || resendCreds.fromEmail;
    const adminEmail = config?.adminEmail || resendCreds.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || 'info@atenaschool.com';

    for (const trigger of activeTriggers) {
      let template: NotificationTemplateRecord | null = trigger.template || null;
      const templateCode = trigger.template_code || trigger.template?.code;

      if (!template && templateCode) {
        template = await getNotificationTemplateByCode(supabase, templateCode);
      }

      if (template && !template.is_active) {
        continue;
      }

      // Match JSON conditions
      const { matchesTriggerConditions } = await import('./trigger-matcher');
      if (!matchesTriggerConditions(payload, trigger.conditions)) {
        continue;
      }

      // Resolve recipient
      let recipient: string | null = null;
      if (trigger.custom_recipient && trigger.custom_recipient.trim()) {
        recipient = trigger.custom_recipient.trim();
      } else if (Number(trigger.channel) === NotificationChannel.EMAIL) {
        if (Number(trigger.recipient_type) === RecipientType.CUSTOMER) {
          recipient = payload.purchaser_email || payload.email || payload.student_email || payload.purchaserEmail || null;
        } else if (Number(trigger.recipient_type) === RecipientType.ADMIN) {
          recipient = adminEmail;
        } else if (Number(trigger.recipient_type) === RecipientType.TEACHER) {
          recipient = payload.teacher_email || payload.teacherEmail || getFieldValue(payload, 'course.teacher.email') || null;
        }
      } else if (Number(trigger.channel) === NotificationChannel.TELEGRAM) {
        recipient = trigger.custom_recipient?.trim() || null;
      }

      const isEmail = Number(trigger.channel) === NotificationChannel.EMAIL;
      const notifType = template?.notification_type || (
        trigger.event_key === 'contact_form.submitted'
          ? NotificationType.CONTACT_FORM
          : trigger.event_key === 'membership.card_issued'
            ? NotificationType.MEMBERSHIP_CARD
            : NotificationType.BOOKING_CONFIRMATION
      );

      if (isEmail && recipient) {
        const blocksConfig = template?.blocks_config?.blocks?.length
          ? template.blocks_config
          : (templateCode ? getDefaultBlocksForTemplate(templateCode, NotificationChannel.EMAIL) : null);

        let subject = `Notifica: ${schoolProfile.name}`;
        let html = '';

        if (blocksConfig) {
          const rendered = renderEmailFromBlocks(blocksConfig, payload, schoolProfile);
          subject = template?.subject ? compileTemplate(template.subject, payload) : rendered.subject;
          html = rendered.html;
        } else if (template?.body_html) {
          subject = template.subject ? compileTemplate(template.subject, payload) : subject;
          html = compileTemplate(template.body_html, payload);
        }

        if (html) {
          const res = await sendEmailViaResend({
            apiKey,
            from: fromEmail,
            to: recipient,
            subject,
            html,
          });

          await logNotification(supabase, {
            channel: NotificationChannel.EMAIL,
            type: notifType,
            recipient,
            subject,
            status: res.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
            notificationTriggerId: trigger.id || null,
            notificationTemplateId: template?.id || null,
            bookingId: payload.booking_id || null,
            provider: 'resend',
            messageId: res.messageId || null,
            error: res.error || null,
            payload,
          });
        }
      } else if (!isEmail) {
        // Telegram
        const blocksConfig = template?.blocks_config?.blocks?.length
          ? template.blocks_config
          : (templateCode ? getDefaultBlocksForTemplate(templateCode, NotificationChannel.TELEGRAM) : null);

        let text = '';
        if (blocksConfig) {
          const rendered = renderTelegramFromBlocks(blocksConfig, payload);
          text = rendered.text;
        } else if (template?.body_text) {
          text = compileTemplate(template.body_text, payload);
        }

        // Build inline keyboard
        let inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> | undefined = undefined;

        if (payload.booking_id && (eventKey.startsWith('booking.') || eventKey.startsWith('payment.'))) {
          const hasUnpaid = !payload.is_paid_online;
          inlineKeyboard = buildBookingTelegramKeyboard({
            bookingId: payload.booking_id,
            hasUnpaidFee: hasUnpaid,
            isCourseUnpaid: hasUnpaid,
            phone: payload.purchaser_phone || payload.phone || null,
            adminUrl: payload.admin_url,
            stripePaymentIntentId: payload.stripe_payment_intent_id || null,
            regFeeEur: payload.registration_fee,
          });
        } else if (eventKey === 'contact_form.submitted') {
          const rawPhone = payload.sender_phone || payload.phone || '';
          const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
          const actionRow: Array<{ text: string; url?: string }> = [];
          if (cleanPhone) {
            actionRow.push({ text: '💬 WhatsApp', url: `https://wa.me/${cleanPhone}` });
          }
          if (payload.admin_url) {
            actionRow.push({ text: '🌐 Admin CRM', url: `${payload.admin_url}/prenotazioni` });
          }
          if (actionRow.length > 0) {
            inlineKeyboard = [actionRow];
          }
        }

        if (text) {
          await sendTelegramMessage({
            supabase,
            text,
            inlineKeyboard,
            bookingId: payload.booking_id || null,
            notificationType: notifType,
            notificationTriggerId: trigger.id || null,
            notificationTemplateId: template?.id || null,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error in processNotificationTriggers:', err);
  }
}


