import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingPaymentStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationTemplateRecord,
  RecipientType,
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


export async function sendBookingNotificationEmails(params: {
  supabase: SupabaseClient;
  booking: SupabaseBookingRow;
  course: SupabaseCourseRow | null;
  dto: CreateReservationParams;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, booking, course, dto, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const resendCreds = await getResendCredentials(supabase);
  const domainsCreds = await getDomainsCredentials(supabase);
  const courseName = course?.name || course?.title_it || `Corso ${schoolProfile.name}`;
  const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
    : purchaserName;
  const adminEmail = config?.adminEmail || resendCreds.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || 'info@atenaschool.com';
  const fromEmail = config?.fromEmail || resendCreds.fromEmail;
  const appUrl = config?.appUrl || domainsCreds.appUrl || schoolProfile.app_url || process.env.NEXT_PUBLIC_APP_URL || 'https://app.atenaschool.com';
  const adminUrl = domainsCreds.adminUrl || schoolProfile.admin_url || process.env.NEXT_PUBLIC_ADMIN_URL || 'https://atena-school-admin.vercel.app';
  const apiKey = config?.resendApiKey || resendCreds.apiKey;

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

  // Common dynamic variables dictionary for template engine
  const templateVariables: Record<string, any> = {
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
  };

  // 1. Client Confirmation / Payment Receipt Email
  if (dto.email) {
    const templateCode = isPaidOnline ? 'payment_receipt_customer' : 'booking_confirmation_customer';
    let subject = `Conferma Iscrizione: ${courseName} • ${schoolProfile.name}`;
    let html = '';

    const clientTmpl = await getNotificationTemplateByCode(supabase, templateCode);
    if (clientTmpl) {
      if (clientTmpl.is_active) {
        // Use saved blocks_config or fall back to default blocks (never stale body_html)
        const blocksConfig = clientTmpl.blocks_config?.blocks?.length
          ? clientTmpl.blocks_config
          : getDefaultBlocksForTemplate(templateCode, NotificationChannel.EMAIL);
        const rendered = renderEmailFromBlocks(blocksConfig, templateVariables, schoolProfile);
        html = rendered.html;
        subject = clientTmpl.subject ? compileTemplate(clientTmpl.subject, templateVariables) : rendered.subject;
      }
      // if !is_active → html stays '' → client email silently skipped
    } else {
      // Template not found in DB → hardcoded fallback
      const fallbackRendered = renderClientBookingConfirmationEmail(templateData);
      subject = fallbackRendered.subject;
      html = fallbackRendered.html;
    }

    if (html) {
      const clientRes = await sendEmailViaResend({
        apiKey,
        from: fromEmail,
        to: dto.email,
        subject,
        html,
      });

      await logNotification(supabase, {
        channel: NotificationChannel.EMAIL,
        type: isPaidOnline ? NotificationType.PAYMENT_RECEIPT : NotificationType.BOOKING_CONFIRMATION,
        recipient: dto.email,
        subject,
        status: clientRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        bookingId: booking.id,
        provider: 'resend',
        messageId: clientRes.messageId || null,
        error: clientRes.error || null,
        payload: { courseName, totalEur, isPaidOnline },
      });
    }
  }

  // 2. Admin Notification Email
  if (adminEmail) {
    const adminTmpl = await getNotificationTemplateByCode(supabase, 'booking_alert_admin');
    let subject = `🔔 Nuova Iscrizione: ${studentName} — ${courseName}`;
    let html = '';

    if (adminTmpl) {
      if (adminTmpl.is_active) {
        const blocksConfig = adminTmpl.blocks_config?.blocks?.length
          ? adminTmpl.blocks_config
          : getDefaultBlocksForTemplate('booking_alert_admin', NotificationChannel.EMAIL);
        const rendered = renderEmailFromBlocks(blocksConfig, templateVariables, schoolProfile);
        html = rendered.html;
        subject = adminTmpl.subject ? compileTemplate(adminTmpl.subject, templateVariables) : rendered.subject;
      }
      // if !is_active → html stays '' → admin email silently skipped
    } else {
      // Template not found in DB → hardcoded fallback
      const fallbackRendered = renderAdminBookingNotificationEmail(templateData);
      subject = fallbackRendered.subject;
      html = fallbackRendered.html;
    }

    if (html) {
      const adminRes = await sendEmailViaResend({
        apiKey,
        from: fromEmail,
        to: adminEmail,
        subject,
        html,
      });

      await logNotification(supabase, {
        channel: NotificationChannel.EMAIL,
        type: NotificationType.BOOKING_CONFIRMATION,
        recipient: adminEmail,
        subject,
        status: adminRes.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        bookingId: booking.id,
        provider: 'resend',
        messageId: adminRes.messageId || null,
        error: adminRes.error || null,
        payload: { courseName, studentName, totalEur },
      });
    }
  }

  // 3. Process Dynamic Event Automation Triggers
  try {
    await processNotificationTriggers(
      supabase,
      isPaidOnline ? 'booking.created_stripe' : 'booking.pending_cash',
      templateVariables
    );
  } catch (triggerErr) {
    console.warn('[NotificationTriggers]: Error executing custom booking triggers:', triggerErr);
  }
}

export async function sendContactFormNotificationEmail(params: {
  supabase: SupabaseClient;
  data: ContactEmailTemplateData;
  config?: EmailServiceConfig;
}): Promise<void> {
  const { supabase, data, config } = params;
  const schoolProfile = await getSchoolProfile(supabase);
  const resendCreds = await getResendCredentials(supabase);
  const domainsCreds = await getDomainsCredentials(supabase);
  const adminEmail = config?.adminEmail || resendCreds.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || 'info@atenaschool.com';
  const fromEmail = config?.fromEmail || resendCreds.fromEmail;
  const apiKey = config?.resendApiKey || resendCreds.apiKey;

  data.schoolProfile = schoolProfile;
  const senderName = `${data.firstName} ${data.lastName}`.trim();

  const leadVariables: Record<string, any> = {
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

  const leadTmpl = await getNotificationTemplateByCode(supabase, 'contact_lead_admin');
  let subject = `📩 Nuovo Messaggio dal Sito: ${senderName}`;
  let html = '';

  if (leadTmpl) {
    if (leadTmpl.is_active) {
      const blocksConfig = leadTmpl.blocks_config?.blocks?.length
        ? leadTmpl.blocks_config
        : getDefaultBlocksForTemplate('contact_lead_admin', NotificationChannel.EMAIL);
      const rendered = renderEmailFromBlocks(blocksConfig, leadVariables, schoolProfile);
      html = rendered.html;
      subject = leadTmpl.subject ? compileTemplate(leadTmpl.subject, leadVariables) : rendered.subject;
    }
    // if !is_active → email silently skipped
  } else {
    // Template not found in DB → hardcoded fallback
    const fallbackRendered = renderContactFormAdminEmail(data);
    subject = fallbackRendered.subject;
    html = fallbackRendered.html;
  }

  if (html) {
    const res = await sendEmailViaResend({
      apiKey,
      from: fromEmail,
      to: adminEmail,
      subject,
      html,
    });

    await logNotification(supabase, {
      channel: NotificationChannel.EMAIL,
      type: NotificationType.CONTACT_FORM,
      recipient: adminEmail,
      subject,
      status: res.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      provider: 'resend',
      messageId: res.messageId || null,
      error: res.error || null,
      payload: { name: senderName, email: data.email, phone: data.phone },
    });
  }

  // Process Dynamic Event Automation Triggers for Contact Form
  try {
    await processNotificationTriggers(supabase, 'contact_form.submitted', leadVariables);
  } catch (triggerErr) {
    console.warn('[NotificationTriggers]: Error executing custom contact triggers:', triggerErr);
  }

  // Telegram lead alert (fire-and-forget)
  sendTelegramLeadAlert(supabase, leadVariables).catch((err) =>
    console.warn('Async Telegram lead alert error:', err)
  );
}

/**
 * Sends a Telegram notification to the school channel when a contact form is submitted.
 * Uses DB template blocks_config if available, otherwise falls back to getDefaultBlocksForTemplate.
 */
async function sendTelegramLeadAlert(
  supabase: SupabaseClient,
  leadVariables: Record<string, any>
): Promise<void> {
  try {
    const tgTmpl = await getNotificationTemplateByCode(supabase, 'telegram_lead_alert');
    if (tgTmpl && !tgTmpl.is_active) return;

    const blocksConfig = tgTmpl?.blocks_config?.blocks?.length
      ? tgTmpl.blocks_config
      : getDefaultBlocksForTemplate('telegram_lead_alert', NotificationChannel.TELEGRAM);

    const { text } = renderTelegramFromBlocks(blocksConfig, leadVariables);

    const inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
    const rawPhone = leadVariables.sender_phone || leadVariables.phone || '';
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    const domainsCreds = await getDomainsCredentials(supabase);
    const crmUrl = domainsCreds.adminUrl || process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || 'https://atena-school-admin.vercel.app';
    const actionRow: Array<{ text: string; url?: string }> = [];

    if (cleanPhone) {
      actionRow.push({ text: '💬 WhatsApp', url: `https://wa.me/${cleanPhone}` });
    }
    actionRow.push({ text: '🌐 Admin CRM', url: `${crmUrl}/prenotazioni` });

    if (actionRow.length > 0) {
      inlineKeyboard.push(actionRow);
    }

    await sendTelegramMessage({
      supabase,
      text,
      inlineKeyboard,
      notificationType: NotificationType.CONTACT_FORM,
    });
  } catch (err) {
    console.warn('Telegram lead alert error:', err);
  }
}

export async function sendTelegramMessage(params: {
  supabase?: SupabaseClient;
  botToken?: string;
  chatId?: string;
  chatIds?: string[];
  text: string;
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  bookingId?: string | null;
  notificationType?: NotificationType;
  isCash?: boolean;
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  let token = params.botToken;
  let chat = params.chatId;
  let chatIds = params.chatIds;

  if (params.supabase) {
    const tgCreds = await getTelegramCredentials(params.supabase);
    token = token || tgCreds.botToken;
    chat = chat || tgCreds.chatId;
    if (!chatIds || chatIds.length === 0) {
      chatIds = tgCreds.chatIds;
    }

    // Check notification type filter flags
    if (params.isCash && tgCreds.notifyCash === false) {
      return { success: true };
    }
    if (params.notificationType) {
      if (params.notificationType === NotificationType.CONTACT_FORM && tgCreds.notifyLeads === false) {
        return { success: true };
      }
      if (params.notificationType === NotificationType.BOOKING_CONFIRMATION && tgCreds.notifyBookings === false) {
        return { success: true };
      }
      if (params.notificationType === NotificationType.PAYMENT_RECEIPT && tgCreds.notifyPayments === false) {
        return { success: true };
      }
    }
  }

  token = token || process.env.TELEGRAM_BOT_TOKEN;
  chat = chat || process.env.TELEGRAM_CHAT_ID;

  // Extract all target chat IDs (supports comma, space, semicolon or array)
  const targetChats: string[] = [];
  if (chatIds && chatIds.length > 0) {
    for (const c of chatIds) {
      const parts = String(c).split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
      targetChats.push(...parts);
    }
  } else if (chat) {
    const parts = String(chat).split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    targetChats.push(...parts);
  }

  // Deduplicate
  const uniqueChats = Array.from(new Set(targetChats));

  if (!token || uniqueChats.length === 0) {
    return { success: false, error: 'Telegram BOT_TOKEN or CHAT_ID not configured' };
  }

  let lastMsgId: number | undefined;
  let lastError: string | undefined;
  let successCount = 0;

  for (const recipient of uniqueChats) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const body: Record<string, any> = {
        chat_id: recipient,
        text: params.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };

      if (params.inlineKeyboard && params.inlineKeyboard.length > 0) {
        body.reply_markup = { inline_keyboard: params.inlineKeyboard };
      }

      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };

      if (!res.ok || !json.ok) {
        const errStr = json.description || `HTTP error ${res.status}`;
        lastError = errStr;
        if (params.supabase) {
          await logNotification(params.supabase, {
            channel: NotificationChannel.TELEGRAM,
            type: params.notificationType || NotificationType.BOOKING_CONFIRMATION,
            recipient,
            status: NotificationStatus.FAILED,
            bookingId: params.bookingId || null,
            provider: 'telegram',
            error: errStr,
            payload: { text: params.text },
          });
        }
      } else {
        successCount++;
        lastMsgId = json.result?.message_id;
        if (params.supabase) {
          await logNotification(params.supabase, {
            channel: NotificationChannel.TELEGRAM,
            type: params.notificationType || NotificationType.BOOKING_CONFIRMATION,
            recipient,
            status: NotificationStatus.SENT,
            bookingId: params.bookingId || null,
            provider: 'telegram',
            messageId: lastMsgId ? String(lastMsgId) : null,
            payload: { text: params.text },
          });
        }
      }
    } catch (err: any) {
      lastError = err?.message || 'Network error';
    }
  }

  return {
    success: successCount > 0,
    messageId: lastMsgId,
    error: successCount === 0 ? lastError : undefined,
  };
}

import { SYSTEM_TRIGGERS, SystemTriggerDefinition } from './system-triggers.config';

/**
 * Universal Event-Driven Trigger Processor for Vercel Server Actions & Next.js
 * Uses type-safe declarative TypeScript triggers from SYSTEM_TRIGGERS registry.
 */
export async function processNotificationTriggers(
  supabase: SupabaseClient,
  eventKey: string,
  payload: Record<string, any>
): Promise<void> {
  try {
    const activeTriggers = SYSTEM_TRIGGERS.filter(
      (t) => t.event_key === eventKey && t.is_active
    );

    if (activeTriggers.length === 0) {
      return;
    }

    const schoolProfile = await getSchoolProfile(supabase);
    const resendCreds = await getResendCredentials(supabase);

    for (const trigger of activeTriggers) {
      const template = await getNotificationTemplateByCode(supabase, trigger.template_code);
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
        if (Number(trigger.recipient_type) === RecipientType.CUSTOMER || Number(trigger.recipient_type) === 3) {
          recipient = payload.purchaser_email || payload.email || payload.student_email || payload.purchaserEmail || null;
        } else if (Number(trigger.recipient_type) === RecipientType.TEACHER || Number(trigger.recipient_type) === 2) {
          recipient = payload.teacher_email || payload.teacherEmail || getFieldValue(payload, 'course.teacher.email') || null;
        } else if (Number(trigger.recipient_type) === RecipientType.ADMIN || Number(trigger.recipient_type) === 1) {
          recipient = resendCreds.adminEmail || schoolProfile.secretariat_email || schoolProfile.email || 'info@atenaschool.com';
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
          : getDefaultBlocksForTemplate(trigger.template_code, NotificationChannel.EMAIL);

        const rendered = renderEmailFromBlocks(blocksConfig, payload, schoolProfile);
        const subject = template?.subject ? compileTemplate(template.subject, payload) : rendered.subject;
        const html = rendered.html;

        if (html) {
          const res = await sendEmailViaResend({
            apiKey: resendCreds.apiKey,
            from: resendCreds.fromEmail,
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
          : getDefaultBlocksForTemplate(trigger.template_code, NotificationChannel.TELEGRAM);

        const rendered = renderTelegramFromBlocks(blocksConfig, payload);
        const text = rendered.text;

        if (text) {
          await sendTelegramMessage({
            supabase,
            text,
            bookingId: payload.booking_id || null,
            notificationType: notifType,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error in processNotificationTriggers:', err);
  }
}


