import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingPaymentStatus,
  BookingStatus,
  MembershipStatus,
  PaymentRecordStatus,
  PaymentType,
  LessonStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  ACADEMIC_YEAR,
} from '@atena/api-types';
import { renderTelegramFromBlocks, getDefaultBlocksForTemplate } from './block-compiler';
import { getTelegramCredentials, getDomainsCredentials } from '../system/integration-secrets.service';

export type TelegramLocale = 'it' | 'en';

export interface TelegramButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export const TELEGRAM_I18N = {
  it: {
    header: '🏛️ <b>NUOVA ISCRIZIONE</b>',
    course: '📚 <b>Corso:</b>',
    startDate: '🗓 <b>Data di Inizio:</b>',
    schedule: '⏰ <b>Orario & Giorni:</b>',
    location: '📍 <b>Sede:</b> In Presenza',
    purchaserHeader: '👤 <b>ACQUIRENTE / GENITORE:</b>',
    name: '• Nome:',
    email: '• 📧 Email:',
    phone: '• 📱 Telefono:',
    taxCode: '• 🧾 Codice Fiscale:',
    electronicInvoice: '• 💼 Fattura Elettronica: PEC <code>{pec}</code> • SDI <code>{sdi}</code>',
    studentHeader: '👶 <b>DATI STUDENTE (MINORE):</b>',
    birthDate: '• 🎂 Data di Nascita:',
    birthPlace: '• 📍 Luogo di Nascita:',
    studentEmail: '• 📧 Email Studente:',
    studentPhone: '• 📱 Tel Studente:',
    notIndicated: 'Non indicato',
    toBeAgreed: 'Da concordare con la segreteria',
    financialSummary: '💶 <b>RIEPILOGO ECONOMICO:</b>',
    courseFee: '• Quota Corso:',
    regFee: '• Quota Associativa Annuale:',
    promoApplied: '• 🏷️ Promo Code:',
    promoDiscount: '• 🏷️ Sconto Promo:',
    totalPaid: '• 💳 <b>Totale Incassato:</b>',
    totalDue: '• 💳 <b>Totale Da Saldare:</b>',
    paymentStatus: '• Stato Pagamento:',
    paidOnline: 'Pagato Online con Carta (Stripe)',
    reservedAtVenue: 'Prenotato con Saldo in Sede (In attesa)',
    settledAtVenue: 'Saldato in Sede (Confermato)',
    cancelledStatus: 'Annullata',
    notesHeader: '📝 <b>Note del Cliente:</b>',
    updateHeader: '⚡ <b>Aggiornamento:</b>',
    bookingId: '🆔 <b>ID Prenotazione:</b>',
    // Buttons
    btnSettleFee: '💶 Salda Quota €30',
    btnSettleCourse: '🎓 Salda Corso',
    btnSettleAll: '✅ Salda Tutto',
    btnCancel: '❌ Annulla Iscrizione',
    btnWhatsApp: '💬 WhatsApp',
    btnStripe: '💳 Stripe',
    btnAdminCrm: '🌐 Admin CRM',
    btnLangEn: '🇬🇧 English',
    btnLangIt: '🇮🇹 Italiano',
    // Callbacks / Toasts
    feeSettledToast: '💶 Quota associativa registrata!',
    feeSettledLog: '✅ <i>Quota associativa registrata alle {time} da @{user}</i>',
    courseSettledToast: '🎓 Quota corso confermata!',
    courseSettledLog: '✅ <i>Corso saldato alle {time} da @{user}</i>',
    allSettledToast: '✅ Saldo completo confermato!',
    allSettledLog: '✅ <i>Saldo totale confermato alle {time} da @{user}</i>',
    cancelledToast: '❌ Prenotazione annullata.',
    cancelledLog: '❌ <i>Iscrizione annullata alle {time} da @{user}</i>',
    langSwitchedToast: '🇮🇹 Lingua impostata su Italiano',
    unauthorizedToast: '⛔ Accesso non autorizzato',
    invalidActionToast: '⚠️ Azione non valida',
    bookingNotFoundToast: '❌ Prenotazione non trovata',
  },
  en: {
    header: '🏛️ <b>NEW REGISTRATION</b>',
    course: '📚 <b>Course:</b>',
    startDate: '🗓 <b>Start Date:</b>',
    schedule: '⏰ <b>Schedule & Hours:</b>',
    location: '📍 <b>Location:</b> In-Person',
    purchaserHeader: '👤 <b>PURCHASER / PARENT:</b>',
    name: '• Name:',
    email: '• 📧 Email:',
    phone: '• 📱 Phone:',
    taxCode: '• 🧾 Tax Code (CF):',
    electronicInvoice: '• 💼 Electronic Invoice: PEC <code>{pec}</code> • SDI <code>{sdi}</code>',
    studentHeader: '👶 <b>STUDENT DETAILS (MINOR):</b>',
    birthDate: '• 🎂 Date of Birth:',
    birthPlace: '• 📍 Place of Birth:',
    studentEmail: '• 📧 Student Email:',
    studentPhone: '• 📱 Student Phone:',
    notIndicated: 'Not specified',
    toBeAgreed: 'To be agreed with administration',
    financialSummary: '💶 <b>FINANCIAL SUMMARY:</b>',
    courseFee: '• Course Fee:',
    regFee: '• Annual Membership Fee:',
    promoApplied: '• 🏷️ Promo Code:',
    promoDiscount: '• 🏷️ Promo Discount:',
    totalPaid: '• 💳 <b>Total Received:</b>',
    totalDue: '• 💳 <b>Total Due:</b>',
    paymentStatus: '• Payment Status:',
    paidOnline: 'Paid Online via Card (Stripe)',
    reservedAtVenue: 'Reserved with On-site Payment (Pending)',
    settledAtVenue: 'Settled On-site (Confirmed)',
    cancelledStatus: 'Cancelled',
    notesHeader: '📝 <b>Customer Notes:</b>',
    updateHeader: '⚡ <b>Update:</b>',
    bookingId: '🆔 <b>Booking ID:</b>',
    // Buttons
    btnSettleFee: '💶 Settle Fee €30',
    btnSettleCourse: '🎓 Settle Course',
    btnSettleAll: '✅ Settle All',
    btnCancel: '❌ Cancel Booking',
    btnWhatsApp: '💬 WhatsApp',
    btnStripe: '💳 Stripe',
    btnAdminCrm: '🌐 Admin CRM',
    btnLangEn: '🇬🇧 English',
    btnLangIt: '🇮🇹 Italiano',
    // Callbacks / Toasts
    feeSettledToast: '💶 Annual membership fee recorded!',
    feeSettledLog: '✅ <i>Annual membership fee recorded at {time} by @{user}</i>',
    courseSettledToast: '🎓 Course fee confirmed!',
    courseSettledLog: '✅ <i>Course fee settled at {time} by @{user}</i>',
    allSettledToast: '✅ Full payment confirmed!',
    allSettledLog: '✅ <i>Full payment confirmed at {time} by @{user}</i>',
    cancelledToast: '❌ Booking cancelled.',
    cancelledLog: '❌ <i>Booking cancelled at {time} by @{user}</i>',
    langSwitchedToast: '🇬🇧 Language switched to English',
    unauthorizedToast: '⛔ Unauthorized access',
    invalidActionToast: '⚠️ Invalid action',
    bookingNotFoundToast: '❌ Booking not found',
  },
};

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDisplayDate(dateStr?: string | null, locale: TelegramLocale = 'it'): string {
  const i18n = TELEGRAM_I18N[locale] || TELEGRAM_I18N.it;
  if (!dateStr || dateStr.trim() === '') return i18n.toBeAgreed;
  try {
    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = raw.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month - 1, day);
      const dayNamesIt = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayNames = locale === 'en' ? dayNamesEn : dayNamesIt;
      const formattedDay = String(day).padStart(2, '0');
      const formattedMonth = String(month).padStart(2, '0');
      return `${formattedDay}/${formattedMonth}/${year} (${dayNames[d.getDay()]})`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function formatBirthDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '') return '';
  try {
    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = raw.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Builds the interactive inline keyboard markup for a booking message
 */
export function buildBookingTelegramKeyboard(params: {
  bookingId: string;
  hasUnpaidFee: boolean;
  isCourseUnpaid: boolean;
  isCancelled?: boolean;
  phone?: string | null;
  adminUrl?: string;
  stripePaymentIntentId?: string | null;
  locale?: TelegramLocale;
  regFeeEur?: string | number;
}): TelegramButton[][] {
  const { bookingId, hasUnpaidFee, isCourseUnpaid, isCancelled, phone, adminUrl, stripePaymentIntentId, regFeeEur } = params;
  const locale = params.locale || 'it';
  const i18n = TELEGRAM_I18N[locale] || TELEGRAM_I18N.it;
  const keyboard: TelegramButton[][] = [];

  if (!isCancelled) {
    const actionRow1: TelegramButton[] = [];
    if (hasUnpaidFee) {
      const feeLabel = regFeeEur
        ? (locale === 'it' ? `💶 Salda Quota €${Number(regFeeEur).toFixed(0)}` : `💶 Settle Fee €${Number(regFeeEur).toFixed(0)}`)
        : i18n.btnSettleFee;
      actionRow1.push({ text: feeLabel, callback_data: `fee:${bookingId}:${locale}` });
    }
    if (isCourseUnpaid) {
      actionRow1.push({ text: i18n.btnSettleCourse, callback_data: `course:${bookingId}:${locale}` });
    }
    if (actionRow1.length > 0) {
      keyboard.push(actionRow1);
    }

    if (hasUnpaidFee && isCourseUnpaid) {
      keyboard.push([{ text: i18n.btnSettleAll, callback_data: `all:${bookingId}:${locale}` }]);
    }

    if (hasUnpaidFee || isCourseUnpaid) {
      keyboard.push([{ text: i18n.btnCancel, callback_data: `cancel:${bookingId}:${locale}` }]);
    }
  }

  // Links row (WhatsApp, Stripe, CRM)
  const linksRow: TelegramButton[] = [];
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const waNumber = cleanPhone.startsWith('+')
      ? cleanPhone.slice(1)
      : cleanPhone.startsWith('39')
        ? cleanPhone
        : `39${cleanPhone}`;
    if (waNumber.length > 5) {
      linksRow.push({ text: i18n.btnWhatsApp, url: `https://wa.me/${waNumber}` });
    }
  }

  if (stripePaymentIntentId) {
    linksRow.push({ text: i18n.btnStripe, url: `https://dashboard.stripe.com/payments/${stripePaymentIntentId}` });
  }

  const crmUrl = adminUrl || process.env.ADMIN_URL || 'https://atena-school-admin.vercel.app';
  linksRow.push({ text: i18n.btnAdminCrm, url: `${crmUrl}/prenotazioni` });

  if (linksRow.length > 0) {
    keyboard.push(linksRow);
  }

  // Language switch toggle row
  const nextLocale: TelegramLocale = locale === 'it' ? 'en' : 'it';
  const langButtonText = locale === 'it' ? i18n.btnLangEn : i18n.btnLangIt;
  keyboard.push([{ text: langButtonText, callback_data: `lang:${nextLocale}:${bookingId}` }]);

  return keyboard;
}

/**
 * Formats a rich booking alert message for Telegram
 */
export function formatBookingTelegramHtml(data: {
  courseName: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone?: string | null;
  purchaserTaxCode?: string | null;
  birthPlace?: string | null;
  studentName?: string | null;
  studentTaxCode?: string | null;
  studentBirthDate?: string | null;
  studentBirthPlace?: string | null;
  studentEmail?: string | null;
  studentPhone?: string | null;
  isForChild?: boolean;
  needsCompanyInvoice?: boolean;
  pecEmail?: string | null;
  sdiCode?: string | null;
  date?: string | null;
  time?: string | null;
  lessonSchedule?: string | null;
  totalEur: string | number;
  courseFeeEur?: string | number;
  regFeeEur?: string | number;
  discountAmount?: string | number | null;
  promoCode?: string | null;
  isPaidOnline?: boolean;
  paymentStatusText?: string;
  bookingId: string;
  notes?: string | null;
  stripePaymentIntentId?: string | null;
  actionLog?: string | null;
  locale?: TelegramLocale;
}): string {
  const locale = data.locale || 'it';
  const i18n = TELEGRAM_I18N[locale] || TELEGRAM_I18N.it;
  const isPaid = Boolean(data.isPaidOnline);
  const statusEmoji = isPaid ? '✅' : '⏳';
  const startDateFormatted = formatDisplayDate(data.date, locale);
  const birthDateFormatted = formatBirthDate(data.studentBirthDate);
  const scheduleFormatted =
    data.lessonSchedule && data.lessonSchedule !== 'N/D' && data.lessonSchedule !== 'Da concordare'
      ? data.lessonSchedule
      : data.time || i18n.toBeAgreed;

  const resolvedPaymentStatus = data.paymentStatusText || (isPaid ? i18n.paidOnline : i18n.reservedAtVenue);

  const lines: string[] = [
    i18n.header,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `${i18n.course} ${escapeHtml(data.courseName)}`,
    `${i18n.startDate} <code>${escapeHtml(startDateFormatted)}</code>`,
    `${i18n.schedule} ${escapeHtml(scheduleFormatted)}`,
    i18n.location,
    ``,
    i18n.purchaserHeader,
    `${i18n.name} <b>${escapeHtml(data.purchaserName)}</b>`,
    `${i18n.email} <a href="mailto:${escapeHtml(data.purchaserEmail)}">${escapeHtml(data.purchaserEmail)}</a>`,
    `${i18n.phone} <code>${escapeHtml(data.purchaserPhone || i18n.notIndicated)}</code>`,
    `${i18n.taxCode} <code>${escapeHtml(data.purchaserTaxCode || i18n.notIndicated)}</code>`,
  ];

  if (!data.isForChild && data.birthPlace) {
    lines.push(`${i18n.birthPlace} <code>${escapeHtml(data.birthPlace)}</code>`);
  }

  if (data.needsCompanyInvoice) {
    lines.push(
      i18n.electronicInvoice
        .replace('{pec}', escapeHtml(data.pecEmail || 'N/D'))
        .replace('{sdi}', escapeHtml(data.sdiCode || 'N/D'))
    );
  }

  if (data.isForChild) {
    lines.push(``);
    lines.push(i18n.studentHeader);
    lines.push(`${i18n.name} <b>${escapeHtml(data.studentName || data.purchaserName)}</b>`);
    if (birthDateFormatted) {
      lines.push(`${i18n.birthDate} <code>${escapeHtml(birthDateFormatted)}</code>`);
    }
    if (data.studentBirthPlace || data.birthPlace) {
      lines.push(`${i18n.birthPlace} <code>${escapeHtml(data.studentBirthPlace || data.birthPlace)}</code>`);
    }
    lines.push(`${i18n.taxCode} <code>${escapeHtml(data.studentTaxCode || i18n.notIndicated)}</code>`);
    if (data.studentEmail) {
      lines.push(
        `${i18n.studentEmail} <a href="mailto:${escapeHtml(data.studentEmail)}">${escapeHtml(data.studentEmail)}</a>`
      );
    }
    if (data.studentPhone) {
      lines.push(`${i18n.studentPhone} <code>${escapeHtml(data.studentPhone)}</code>`);
    }
  }

  lines.push(``);
  lines.push(i18n.financialSummary);
  lines.push(`${i18n.courseFee} <b>€${escapeHtml(String(data.courseFeeEur || '0.00'))}</b>`);
  if (Number(data.regFeeEur) > 0) {
    lines.push(`${i18n.regFee} <b>€${escapeHtml(String(data.regFeeEur))}</b>`);
  }
  if (data.promoCode) {
    lines.push(`${i18n.promoApplied} <code>${escapeHtml(data.promoCode)}</code>${Number(data.discountAmount) > 0 ? ` (-€${escapeHtml(String(data.discountAmount))})` : ''}`);
  }
  lines.push(
    `${isPaid ? i18n.totalPaid : i18n.totalDue} <b>€${escapeHtml(String(data.totalEur))}</b>`
  );
  lines.push(`${i18n.paymentStatus} ${statusEmoji} <b>${escapeHtml(resolvedPaymentStatus)}</b>`);

  if (isPaid && data.stripePaymentIntentId) {
    lines.push(`• Stripe Intent ID: <code>${escapeHtml(data.stripePaymentIntentId)}</code>`);
  }

  if (data.notes) {
    lines.push(``);
    lines.push(i18n.notesHeader);
    lines.push(`<i>"${escapeHtml(data.notes)}"</i>`);
  }

  if (data.actionLog) {
    lines.push(``);
    lines.push(i18n.updateHeader);
    lines.push(data.actionLog);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`${i18n.bookingId} <code>${escapeHtml(data.bookingId)}</code>`);

  return lines.join('\n');
}

/**
 * Sends a rich Telegram notification for a new booking with interactive management buttons
 */
export async function sendBookingNotificationTelegram(params: {
  supabase: SupabaseClient;
  booking: any;
  course?: any;
  dto: any;
  botToken?: string;
  chatId?: string;
  adminUrl?: string;
  locale?: TelegramLocale;
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { supabase, booking, course, dto, botToken, chatId, adminUrl } = params;
  const tgCreds = await getTelegramCredentials(supabase);
  const domainsCreds = await getDomainsCredentials(supabase);
  const resolvedAdminUrl = adminUrl || domainsCreds.adminUrl || process.env.ADMIN_URL || 'https://atena-school-admin.vercel.app';
  const token = botToken || tgCreds.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || tgCreds.chatId || process.env.TELEGRAM_CHAT_ID;
  const locale: TelegramLocale = params.locale || (tgCreds.locale as TelegramLocale) || (process.env.TELEGRAM_LOCALE as TelegramLocale) || 'it';
  const i18n = TELEGRAM_I18N[locale] || TELEGRAM_I18N.it;

  if (!token || !chat) {
    return { success: false, error: 'Telegram BOT_TOKEN or CHAT_ID not configured' };
  }

  const courseName = course?.name || course?.title_it || booking.course_name || 'Corso Atena School';
  const purchaserName = `${dto.firstName || booking.purchaser_name || ''} ${dto.lastName || ''}`.trim() || booking.purchaser_name || 'Cliente';
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || booking.student_name || purchaserName
    : booking.student_name || purchaserName;

  const isPaidOnline = Number(booking.payment_status) === BookingPaymentStatus.PAID;
  const paymentStatusText = isPaidOnline ? i18n.paidOnline : i18n.reservedAtVenue;

  const totalEur = Number(booking.amount_paid || 0).toFixed(2);
  const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
  const courseFeeEur = Math.max(0, Number(totalEur) - Number(regFeeEur)).toFixed(2);
  const stripePaymentIntentId = booking.stripe_payment_intent_id || booking.payment_intent_id || null;

  // Build flat variables map for block-based rendering (used if admin saved a custom blocks_config)
  const tgVariables: Record<string, any> = {
    student_name: studentName,
    purchaser_name: purchaserName,
    phone: dto.phone || booking.purchaser_phone || '',
    email: dto.email || booking.purchaser_email || '',
    course_name: courseName,
    start_date: dto.date || booking.start_date || '',
    date: dto.date || booking.start_date || '',
    schedule_text: dto.time || booking.start_time || '',
    lesson_schedule: dto.time || booking.start_time || '',
    payment_status_label: paymentStatusText,
    payment_status: paymentStatusText,
    amount_paid: totalEur,
    total_amount: totalEur,
    course_price: courseFeeEur,
    registration_fee: regFeeEur,
    booking_id: booking.id,
    notes: dto.notes || booking.notes || '',
  };

  // Try DB template first — allows admin to customize via visual builder
  let htmlText = '';
  try {
    const tgTemplateCode = isPaidOnline ? 'telegram_payment_alert' : 'telegram_booking_alert';
    const { data: tgTmpl } = await supabase
      .from('notification_templates')
      .select('blocks_config, is_active')
      .eq('code', tgTemplateCode)
      .maybeSingle();

    if (tgTmpl && !tgTmpl.is_active) {
      // Template explicitly disabled by admin — skip silently
      return { success: true };
    }

    if (tgTmpl?.blocks_config?.blocks?.length) {
      // Admin saved custom blocks → use them
      const { text } = renderTelegramFromBlocks(tgTmpl.blocks_config, tgVariables);
      htmlText = text;
    }
  } catch {
    // Non-blocking: DB error falls through to hardcoded formatter
  }

  // Fallback: rich hardcoded formatter (preserves inline action buttons)
  if (!htmlText) {
    htmlText = formatBookingTelegramHtml({
      courseName,
      purchaserName,
      purchaserEmail: dto.email || booking.purchaser_email,
      purchaserPhone: dto.phone || booking.purchaser_phone,
      purchaserTaxCode: dto.purchaserTaxCode || booking.purchaser_tax_code,
      birthPlace: dto.birthPlace || booking.birth_place,
      studentName,
      studentTaxCode: dto.studentTaxCode || booking.student_tax_code,
      studentBirthDate: dto.studentBirthDate || booking.student_birth_date,
      studentBirthPlace: dto.studentBirthPlace || booking.student_birth_place || booking.birth_place,
      studentEmail: dto.studentEmail || booking.student_email,
      studentPhone: dto.studentPhone || booking.student_phone,
      isForChild: dto.isForChild,
      needsCompanyInvoice: dto.needsCompanyInvoice,
      pecEmail: dto.pecEmail || booking.pec_email,
      sdiCode: dto.sdiCode || booking.sdi_code,
      date: dto.date || booking.start_date,
      time: dto.time || booking.start_time,
      totalEur,
      courseFeeEur,
      regFeeEur,
      discountAmount: booking.discount_amount,
      promoCode: dto.promoCode || booking.promo_code,
      isPaidOnline,
      paymentStatusText,
      bookingId: booking.id,
      notes: dto.notes || booking.notes,
      stripePaymentIntentId,
      locale,
    });
  }

  const hasUnpaidFee = !isPaidOnline && Number(regFeeEur) > 0;
  const isCourseUnpaid = !isPaidOnline;

  const keyboard = buildBookingTelegramKeyboard({
    bookingId: booking.id,
    hasUnpaidFee,
    isCourseUnpaid,
    isCancelled: false,
    phone: dto.phone || booking.purchaser_phone,
    adminUrl: resolvedAdminUrl,
    stripePaymentIntentId,
    locale,
    regFeeEur,
  });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }),
    });

    const json = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
    if (!res.ok || !json.ok) {
      return { success: false, error: json.description || `HTTP ${res.status}` };
    }

    const msgId = json.result?.message_id;

    // Log notification
    try {
      await supabase.from('notification_logs').insert({
        channel: NotificationChannel.TELEGRAM,
        notification_type: NotificationType.BOOKING_CONFIRMATION,
        recipient: chat,
        subject: `Telegram Booking Notification #${booking.id}`,
        request: { bookingId: booking.id, courseName, locale },
        response: json,
        status: NotificationStatus.SENT,
      });
    } catch {
      // Non-blocking log failure
    }

    return { success: true, messageId: msgId };

  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Handles incoming Telegram Callback Queries (inline button clicks)
 */
export async function handleTelegramCallbackAction(params: {
  callbackQuery: any;
  supabase: SupabaseClient;
  botToken?: string;
  allowedChatIds?: string[];
}): Promise<{ success: boolean; message: string }> {
  const { callbackQuery, supabase, botToken, allowedChatIds } = params;
  const tgCreds = await getTelegramCredentials(supabase);
  const token = botToken || tgCreds.botToken || process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { success: false, message: 'Telegram BOT_TOKEN not configured' };
  }

  const queryId = callbackQuery.id;
  const data = callbackQuery.data as string; // format: "action:bookingId[:locale]" or "lang:locale:bookingId"
  const msg = callbackQuery.message;
  const fromUser = callbackQuery.from;
  const chatId = msg?.chat?.id;
  const messageId = msg?.message_id;

  const senderName = fromUser?.first_name || fromUser?.username || 'Admin';

  // Security check: if allowedChatIds is configured, restrict to authorized chats/users
  if (allowedChatIds && allowedChatIds.length > 0) {
    const isChatAllowed = allowedChatIds.includes(String(chatId));
    const isUserAllowed = allowedChatIds.includes(String(fromUser?.id));
    if (!isChatAllowed && !isUserAllowed) {
      await answerCallbackQuery(token, queryId, '⛔ Accesso non autorizzato / Unauthorized', true);
      return { success: false, message: 'Unauthorized chat/user' };
    }
  }

  if (!data || !data.includes(':')) {
    await answerCallbackQuery(token, queryId, '⚠️ Azione non valida / Invalid action', false);
    return { success: false, message: 'Invalid callback data format' };
  }

  const parts = data.split(':');
  let action = parts[0];
  let bookingId = '';
  let currentLocale: TelegramLocale = 'it';

  if (action === 'lang') {
    // format: "lang:<locale>:<bookingId>"
    currentLocale = (parts[1] as TelegramLocale) || 'it';
    bookingId = parts[2] || '';
  } else {
    // format: "<action>:<bookingId>[:<locale>]"
    bookingId = parts[1] || '';
    currentLocale = (parts[2] as TelegramLocale) || 'it';
  }

  const i18n = TELEGRAM_I18N[currentLocale] || TELEGRAM_I18N.it;

  // 1. Fetch booking details
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (bookingErr || !booking) {
    await answerCallbackQuery(token, queryId, i18n.bookingNotFoundToast, true);
    return { success: false, message: 'Booking not found' };
  }

  // 2. Fetch payments for this booking
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId);

  let toastMessage = '';
  let actionLogText = '';

  const nowIso = new Date().toISOString();
  const timeFormatted = new Date().toLocaleTimeString(currentLocale === 'en' ? 'en-GB' : 'it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (action === 'lang') {
    toastMessage = i18n.langSwitchedToast;
  } else if (action === 'fee') {
    // Settle Quota Associativa €30
    const feePayment = payments?.find((p) => p.type === PaymentType.REGISTRATION_FEE);
    if (feePayment) {
      await supabase
        .from('payments')
        .update({ status: PaymentRecordStatus.SUCCEEDED, paid_at: nowIso })
        .eq('id', feePayment.id);
    }

    // Update student
    const studentTaxCode = booking.student_tax_code || booking.purchaser_tax_code;
    const studentId = booking.student_id;

    if (studentId) {
      await supabase
        .from('students')
        .update({ annual_fee_paid: true, annual_fee_paid_at: nowIso, status: 1 })
        .eq('id', studentId);
    } else if (studentTaxCode) {
      await supabase
        .from('students')
        .update({ annual_fee_paid: true, annual_fee_paid_at: nowIso, status: 1 })
        .ilike('tax_code', studentTaxCode.trim());
    }

    // Update annual_memberships
    if (studentTaxCode) {
      await supabase.from('annual_memberships').upsert(
        {
          tax_code: studentTaxCode.trim().toUpperCase(),
          academic_year: ACADEMIC_YEAR.CURRENT,
          status: MembershipStatus.ACTIVE,
          student_id: studentId || null,
          payment_id: feePayment?.id || null,
          paid_at: nowIso,
          expires_at: ACADEMIC_YEAR.EXPIRY_DATE,
        },
        { onConflict: 'tax_code,academic_year' }
      );
    }

    toastMessage = i18n.feeSettledToast;
    actionLogText = i18n.feeSettledLog
      .replace('{time}', timeFormatted)
      .replace('{user}', escapeHtml(senderName));
  } else if (action === 'course') {
    // Settle Course Payment
    const coursePayment = payments?.find((p) => p.type === PaymentType.COURSE_PAYMENT);
    if (coursePayment) {
      await supabase
        .from('payments')
        .update({ status: PaymentRecordStatus.SUCCEEDED, paid_at: nowIso })
        .eq('id', coursePayment.id);
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: BookingPaymentStatus.PAID })
      .eq('id', bookingId);

    toastMessage = i18n.courseSettledToast;
    actionLogText = i18n.courseSettledLog
      .replace('{time}', timeFormatted)
      .replace('{user}', escapeHtml(senderName));
  } else if (action === 'all') {
    // Settle both course and fee
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await supabase
          .from('payments')
          .update({ status: PaymentRecordStatus.SUCCEEDED, paid_at: nowIso })
          .eq('id', p.id);
      }
    }

    // Update student & membership
    const studentTaxCode = booking.student_tax_code || booking.purchaser_tax_code;
    const studentId = booking.student_id;
    if (studentId) {
      await supabase
        .from('students')
        .update({ annual_fee_paid: true, annual_fee_paid_at: nowIso, status: 1 })
        .eq('id', studentId);
    }
    const feePayment = payments?.find((p) => p.type === PaymentType.REGISTRATION_FEE);
    if (studentTaxCode) {
      await supabase.from('annual_memberships').upsert(
        {
          tax_code: studentTaxCode.trim().toUpperCase(),
          academic_year: ACADEMIC_YEAR.CURRENT,
          status: MembershipStatus.ACTIVE,
          student_id: studentId || null,
          payment_id: feePayment?.id || null,
          paid_at: nowIso,
          expires_at: ACADEMIC_YEAR.EXPIRY_DATE,
        },
        { onConflict: 'tax_code,academic_year' }
      );
    }

    await supabase
      .from('bookings')
      .update({ payment_status: BookingPaymentStatus.PAID })
      .eq('id', bookingId);

    toastMessage = i18n.allSettledToast;
    actionLogText = i18n.allSettledLog
      .replace('{time}', timeFormatted)
      .replace('{user}', escapeHtml(senderName));
  } else if (action === 'cancel') {
    // Cancel booking and lessons
    await supabase
      .from('bookings')
      .update({
        booking_status: BookingStatus.CANCELLED,
        payment_status: BookingPaymentStatus.CANCELLED,
      })
      .eq('id', bookingId);

    await supabase
      .from('lessons')
      .update({ status: LessonStatus.CANCELLED })
      .eq('booking_id', bookingId);

    toastMessage = i18n.cancelledToast;
    actionLogText = i18n.cancelledLog
      .replace('{time}', timeFormatted)
      .replace('{user}', escapeHtml(senderName));
  }

  // 3. Send Toast answer to Telegram
  await answerCallbackQuery(token, queryId, toastMessage, false);

  // 4. Update the original Telegram Message with updated statuses and buttons in selected locale
  try {
    const { data: updatedBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    const { data: updatedPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId);

    const isCancelled = Number(updatedBooking?.booking_status) === BookingStatus.CANCELLED;
    const isPaid = Number(updatedBooking?.payment_status) === BookingPaymentStatus.PAID;

    const feeP = updatedPayments?.find((p) => p.type === PaymentType.REGISTRATION_FEE);
    const courseP = updatedPayments?.find((p) => p.type === PaymentType.COURSE_PAYMENT);

    const hasUnpaidFee = !isCancelled && !isPaid && feeP?.status !== PaymentRecordStatus.SUCCEEDED && Number(updatedBooking?.registration_fee || 0) > 0;
    const isCourseUnpaid = !isCancelled && !isPaid && courseP?.status !== PaymentRecordStatus.SUCCEEDED;

    const paymentStatusText = isCancelled
      ? i18n.cancelledStatus
      : isPaid
        ? i18n.settledAtVenue
        : i18n.reservedAtVenue;

    const newHtml = formatBookingTelegramHtml({
      courseName: updatedBooking?.course_name || 'Corso Atena School',
      purchaserName: updatedBooking?.purchaser_name || 'Cliente',
      purchaserEmail: updatedBooking?.purchaser_email || '',
      purchaserPhone: updatedBooking?.purchaser_phone || '',
      purchaserTaxCode: updatedBooking?.purchaser_tax_code || '',
      studentName: updatedBooking?.student_name || updatedBooking?.purchaser_name || '',
      studentTaxCode: updatedBooking?.student_tax_code || '',
      studentBirthDate: updatedBooking?.student_birth_date || '',
      studentEmail: updatedBooking?.student_email || '',
      studentPhone: updatedBooking?.student_phone || '',
      date: updatedBooking?.start_date,
      time: updatedBooking?.start_time,
      totalEur: Number(updatedBooking?.amount_paid || 0).toFixed(2),
      courseFeeEur: Math.max(0, Number(updatedBooking?.amount_paid || 0) - Number(updatedBooking?.registration_fee || 0)).toFixed(2),
      regFeeEur: Number(updatedBooking?.registration_fee || 0).toFixed(2),
      isPaidOnline: isPaid,
      paymentStatusText,
      bookingId: bookingId,
      notes: updatedBooking?.notes,
      actionLog: actionLogText || undefined,
      locale: currentLocale,
    });

    const updatedKeyboard = buildBookingTelegramKeyboard({
      bookingId,
      hasUnpaidFee,
      isCourseUnpaid,
      isCancelled,
      phone: updatedBooking?.purchaser_phone,
      locale: currentLocale,
      regFeeEur: Number(updatedBooking?.registration_fee || 0).toFixed(2),
    });

    await editMessageText(token, chatId, messageId, newHtml, updatedKeyboard);
  } catch (err) {
    console.warn('Telegram edit message error:', err);
  }

  return { success: true, message: toastMessage };
}

async function answerCallbackQuery(token: string, queryId: string, text: string, showAlert = false): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: queryId,
        text,
        show_alert: showAlert,
      }),
    });
  } catch (err) {
    console.warn('answerCallbackQuery error:', err);
  }
}

async function editMessageText(
  token: string,
  chatId: number | string,
  messageId: number,
  text: string,
  inlineKeyboard?: TelegramButton[][]
): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard && inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
      }),
    });
  } catch (err) {
    console.warn('editMessageText error:', err);
  }
}
