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
} from '@atena/api-types';

export interface TelegramButton {
  text: string;
  url?: string;
  callback_data?: string;
}

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '') return 'Da concordare con la segreteria';
  try {
    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = raw.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month - 1, day);
      const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
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
}): TelegramButton[][] {
  const { bookingId, hasUnpaidFee, isCourseUnpaid, isCancelled, phone, adminUrl, stripePaymentIntentId } = params;
  const keyboard: TelegramButton[][] = [];

  if (!isCancelled) {
    const actionRow1: TelegramButton[] = [];
    if (hasUnpaidFee) {
      actionRow1.push({ text: '💶 Salda Quota €30', callback_data: `fee:${bookingId}` });
    }
    if (isCourseUnpaid) {
      actionRow1.push({ text: '🎓 Salda Corso', callback_data: `course:${bookingId}` });
    }
    if (actionRow1.length > 0) {
      keyboard.push(actionRow1);
    }

    if (hasUnpaidFee && isCourseUnpaid) {
      keyboard.push([{ text: '✅ Salda Tutto', callback_data: `all:${bookingId}` }]);
    }

    if (hasUnpaidFee || isCourseUnpaid) {
      keyboard.push([{ text: '❌ Annulla Iscrizione', callback_data: `cancel:${bookingId}` }]);
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
      linksRow.push({ text: '💬 WhatsApp', url: `https://wa.me/${waNumber}` });
    }
  }

  if (stripePaymentIntentId) {
    linksRow.push({ text: '💳 Stripe', url: `https://dashboard.stripe.com/payments/${stripePaymentIntentId}` });
  }

  const crmUrl = adminUrl || process.env.ADMIN_URL || 'https://atena-school-admin.vercel.app';
  linksRow.push({ text: '🌐 Admin CRM', url: `${crmUrl}/prenotazioni` });

  if (linksRow.length > 0) {
    keyboard.push(linksRow);
  }

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
  studentName?: string | null;
  studentTaxCode?: string | null;
  studentBirthDate?: string | null;
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
  isPaidOnline?: boolean;
  paymentStatusText: string;
  bookingId: string;
  notes?: string | null;
  stripePaymentIntentId?: string | null;
  actionLog?: string | null;
}): string {
  const isPaid = Boolean(data.isPaidOnline);
  const statusEmoji = isPaid ? '✅' : '⏳';
  const startDateFormatted = formatDisplayDate(data.date);
  const birthDateFormatted = formatBirthDate(data.studentBirthDate);
  const scheduleFormatted =
    data.lessonSchedule && data.lessonSchedule !== 'N/D' && data.lessonSchedule !== 'Da concordare'
      ? data.lessonSchedule
      : data.time || 'Da concordare con la segreteria';

  const lines: string[] = [
    `🏛️ <b>NUOVA ISCRIZIONE — ATENA SCHOOL</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📚 <b>Corso:</b> ${escapeHtml(data.courseName)}`,
    `🗓 <b>Data di Inizio:</b> <code>${escapeHtml(startDateFormatted)}</code>`,
    `⏰ <b>Orario & Giorni:</b> ${escapeHtml(scheduleFormatted)}`,
    `📍 <b>Sede:</b> In Presenza (Cittanova)`,
    ``,
    `👤 <b>ACQUIRENTE / GENITORE:</b>`,
    `• Nome: <b>${escapeHtml(data.purchaserName)}</b>`,
    `• 📧 Email: <a href="mailto:${escapeHtml(data.purchaserEmail)}">${escapeHtml(data.purchaserEmail)}</a>`,
    `• 📱 Telefono: <code>${escapeHtml(data.purchaserPhone || 'Non indicato')}</code>`,
    `• 🧾 Codice Fiscale: <code>${escapeHtml(data.purchaserTaxCode || 'Non indicato')}</code>`,
  ];

  if (data.needsCompanyInvoice) {
    lines.push(
      `• 💼 Fattura Elettronica: PEC <code>${escapeHtml(data.pecEmail || 'N/D')}</code> • SDI <code>${escapeHtml(data.sdiCode || 'N/D')}</code>`
    );
  }

  if (data.isForChild) {
    lines.push(``);
    lines.push(`👶 <b>DATI STUDENTE (MINORE):</b>`);
    lines.push(`• Nome: <b>${escapeHtml(data.studentName || data.purchaserName)}</b>`);
    if (birthDateFormatted) {
      lines.push(`• 🎂 Data di Nascita: <code>${escapeHtml(birthDateFormatted)}</code>`);
    }
    lines.push(`• 🧾 Codice Fiscale: <code>${escapeHtml(data.studentTaxCode || 'Non indicato')}</code>`);
    if (data.studentEmail) {
      lines.push(
        `• 📧 Email Studente: <a href="mailto:${escapeHtml(data.studentEmail)}">${escapeHtml(data.studentEmail)}</a>`
      );
    }
    if (data.studentPhone) {
      lines.push(`• 📱 Tel Studente: <code>${escapeHtml(data.studentPhone)}</code>`);
    }
  }

  lines.push(``);
  lines.push(`💶 <b>RIEPILOGO ECONOMICO:</b>`);
  lines.push(`• Quota Corso: <b>€${escapeHtml(String(data.courseFeeEur || '0.00'))}</b>`);
  if (Number(data.regFeeEur) > 0) {
    lines.push(`• Quota Associativa Annuale: <b>€${escapeHtml(String(data.regFeeEur))}</b>`);
  }
  lines.push(
    `• 💳 <b>Totale ${isPaid ? 'Incassato' : 'Da Saldare'}:</b> <b>€${escapeHtml(String(data.totalEur))}</b>`
  );
  lines.push(`• Stato Pagamento: ${statusEmoji} <b>${escapeHtml(data.paymentStatusText)}</b>`);

  if (isPaid && data.stripePaymentIntentId) {
    lines.push(`• Stripe Intent ID: <code>${escapeHtml(data.stripePaymentIntentId)}</code>`);
  }

  if (data.notes) {
    lines.push(``);
    lines.push(`📝 <b>Note del Cliente:</b>`);
    lines.push(`<i>"${escapeHtml(data.notes)}"</i>`);
  }

  if (data.actionLog) {
    lines.push(``);
    lines.push(`⚡ <b>Aggiornamento:</b>`);
    lines.push(data.actionLog);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🆔 <b>ID Prenotazione:</b> <code>${escapeHtml(data.bookingId)}</code>`);

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
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { supabase, booking, course, dto, botToken, chatId, adminUrl } = params;
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, error: 'Telegram BOT_TOKEN or CHAT_ID not configured' };
  }

  const courseName = course?.name || course?.title_it || booking.course_name || 'Corso Atena School';
  const purchaserName = `${dto.firstName || booking.purchaser_name || ''} ${dto.lastName || ''}`.trim() || booking.purchaser_name || 'Cliente';
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || booking.student_name || purchaserName
    : booking.student_name || purchaserName;

  const isPaidOnline = Number(booking.payment_status) === BookingPaymentStatus.PAID;
  const paymentStatusText = isPaidOnline
    ? 'Pagato Online con Carta (Stripe)'
    : 'Prenotato con Saldo in Sede (In attesa)';

  const totalEur = Number(booking.amount_paid || 0).toFixed(2);
  const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
  const courseFeeEur = Math.max(0, Number(totalEur) - Number(regFeeEur)).toFixed(2);
  const stripePaymentIntentId = booking.stripe_payment_intent_id || booking.payment_intent_id || null;

  const htmlText = formatBookingTelegramHtml({
    courseName,
    purchaserName,
    purchaserEmail: dto.email || booking.purchaser_email,
    purchaserPhone: dto.phone || booking.purchaser_phone,
    purchaserTaxCode: dto.purchaserTaxCode || booking.purchaser_tax_code,
    studentName,
    studentTaxCode: dto.studentTaxCode || booking.student_tax_code,
    studentBirthDate: dto.studentBirthDate || booking.student_birth_date,
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
    isPaidOnline,
    paymentStatusText,
    bookingId: booking.id,
    notes: dto.notes || booking.notes,
    stripePaymentIntentId,
  });

  const hasUnpaidFee = !isPaidOnline && Number(regFeeEur) > 0;
  const isCourseUnpaid = !isPaidOnline;

  const keyboard = buildBookingTelegramKeyboard({
    bookingId: booking.id,
    hasUnpaidFee,
    isCourseUnpaid,
    phone: dto.phone || booking.purchaser_phone,
    adminUrl,
    stripePaymentIntentId,
  });

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: keyboard },
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
        status: NotificationStatus.SENT,
        booking_id: booking.id,
        provider: 'telegram',
        message_id: msgId ? String(msgId) : null,
        request_payload: { bookingId: booking.id, courseName },
        response_payload: json,
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
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { success: false, message: 'Telegram BOT_TOKEN not configured' };
  }

  const queryId = callbackQuery.id;
  const data = callbackQuery.data as string; // format: "action:bookingId"
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
      await answerCallbackQuery(token, queryId, '⛔ Accesso non autorizzato', true);
      return { success: false, message: 'Unauthorized chat/user' };
    }
  }

  if (!data || !data.includes(':')) {
    await answerCallbackQuery(token, queryId, '⚠️ Azione non valida', false);
    return { success: false, message: 'Invalid callback data format' };
  }

  const [action, bookingId] = data.split(':');

  // 1. Fetch booking details
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (bookingErr || !booking) {
    await answerCallbackQuery(token, queryId, '❌ Prenotazione non trovata', true);
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
  const timeFormatted = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  if (action === 'fee') {
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
          academic_year: '2026/2027',
          status: MembershipStatus.ACTIVE,
          student_id: studentId || null,
          paid_at: nowIso,
          expires_at: '2027-08-31T23:59:59+00:00',
        },
        { onConflict: 'tax_code,academic_year' }
      );
    }

    toastMessage = '💶 Quota associativa €30 registrata!';
    actionLogText = `✅ <i>Quota €30 registrata alle ${timeFormatted} da @${escapeHtml(senderName)}</i>`;
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

    toastMessage = '🎓 Quota corso confermata!';
    actionLogText = `✅ <i>Corso saldato alle ${timeFormatted} da @${escapeHtml(senderName)}</i>`;
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
    if (studentTaxCode) {
      await supabase.from('annual_memberships').upsert(
        {
          tax_code: studentTaxCode.trim().toUpperCase(),
          academic_year: '2026/2027',
          status: MembershipStatus.ACTIVE,
          student_id: studentId || null,
          paid_at: nowIso,
          expires_at: '2027-08-31T23:59:59+00:00',
        },
        { onConflict: 'tax_code,academic_year' }
      );
    }

    await supabase
      .from('bookings')
      .update({ payment_status: BookingPaymentStatus.PAID })
      .eq('id', bookingId);

    toastMessage = '✅ Saldo completo confermato!';
    actionLogText = `✅ <i>Saldo totale confermato alle ${timeFormatted} da @${escapeHtml(senderName)}</i>`;
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

    toastMessage = '❌ Prenotazione annullata.';
    actionLogText = `❌ <i>Iscrizione annullata alle ${timeFormatted} da @${escapeHtml(senderName)}</i>`;
  }

  // 3. Send Toast answer to Telegram
  await answerCallbackQuery(token, queryId, toastMessage, false);

  // 4. Update the original Telegram Message with updated statuses and buttons
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
      ? 'Annullato'
      : isPaid
        ? 'Saldato in Sede (Confermato)'
        : 'In attesa di saldo';

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
      actionLog: actionLogText,
    });

    const updatedKeyboard = buildBookingTelegramKeyboard({
      bookingId,
      hasUnpaidFee,
      isCourseUnpaid,
      isCancelled,
      phone: updatedBooking?.purchaser_phone,
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
