import { BookingEmailTemplateData, ContactEmailTemplateData } from './email-templates';
import { logNotification } from './api-logger';
import { NotificationChannel, NotificationStatus, NotificationType } from '@atena/api-types';

/**
 * Escapes HTML characters for Telegram HTML parse mode
 */
function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sends a notification message to Telegram via the Telegram Bot API.
 */
export async function sendTelegramMessage(
  htmlText: string,
  inlineKeyboard?: Array<Array<{ text: string; url: string }>>,
  notificationType: number = NotificationType.BOOKING_CONFIRMATION,
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('[TELEGRAM NOTIFICATION SKIPPED]: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
    return false;
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (inlineKeyboard && inlineKeyboard.length > 0) {
    payload.reply_markup = {
      inline_keyboard: inlineKeyboard,
    };
  }

  let result: { success: boolean; data?: any; error?: any } = { success: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[TELEGRAM ERROR] Status ${response.status}:`, errorText);
      result = { success: false, error: errorText };
    } else {
      const data = await response.json().catch(() => ({}));
      console.log('[TELEGRAM SUCCESS] Sent notification (Msg ID:', (data as { result?: { message_id?: number } }).result?.message_id, ')');
      result = { success: true, data };
    }
  } catch (err) {
    console.error('[TELEGRAM NETWORK ERROR]:', err);
    result = { success: false, error: err };
  }

  // Async log to notification_logs
  logNotification({
    channel: NotificationChannel.TELEGRAM,
    notificationType,
    recipient: String(chatId),
    subject: 'Telegram Notification',
    request: payload,
    response: result,
    status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
  }).catch(() => null);

  return result.success;
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
 * Sends a rich booking notification to the admin Telegram chat/channel.
 */
export async function sendTelegramBookingNotification(data: BookingEmailTemplateData): Promise<boolean> {
  const isPaid = data.isPaidOnline;
  const statusEmoji = isPaid ? '✅' : '⏳';
  const cleanPhone = (data.purchaserPhone || '').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;
  const stripeDashboardUrl = data.stripeDashboardUrl || (data.stripePaymentIntentId ? `https://dashboard.stripe.com/payments/${data.stripePaymentIntentId}` : null);
  const adminCrmUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://atena-school-admin.vercel.app';

  const startDateFormatted = formatDisplayDate(data.date);
  const birthDateFormatted = formatBirthDate(data.studentBirthDate);
  const scheduleFormatted = data.lessonSchedule && data.lessonSchedule !== 'N/D' && data.lessonSchedule !== 'Da concordare'
    ? data.lessonSchedule
    : (data.time || 'Da concordare con la segreteria');

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
    lines.push(`• 💼 Fattura Elettronica: PEC <code>${escapeHtml(data.pecEmail || 'N/D')}</code> • SDI <code>${escapeHtml(data.sdiCode || 'N/D')}</code>`);
  }

  if (data.isForChild) {
    lines.push(``);
    lines.push(`👶 <b>DATI STUDENTE (MINORE):</b>`);
    lines.push(`• Nome: <b>${escapeHtml(data.studentName)}</b>`);
    if (birthDateFormatted) {
      lines.push(`• 🎂 Data di Nascita: <code>${escapeHtml(birthDateFormatted)}</code>`);
    }
    lines.push(`• 🧾 Codice Fiscale: <code>${escapeHtml(data.studentTaxCode || 'Non indicato')}</code>`);
    if (data.studentEmail) {
      lines.push(`• 📧 Email Studente: <a href="mailto:${escapeHtml(data.studentEmail)}">${escapeHtml(data.studentEmail)}</a>`);
    }
    if (data.studentPhone) {
      lines.push(`• 📱 Tel Studente: <code>${escapeHtml(data.studentPhone)}</code>`);
    }
  }

  lines.push(``);
  lines.push(`💶 <b>RIEPILOGO ECONOMICO:</b>`);
  lines.push(`• Quota Corso: <b>€${escapeHtml(data.courseFeeEur || '0.00')}</b>`);
  if (Number(data.regFeeEur) > 0) {
    lines.push(`• Quota Associativa Annuale: <b>€${escapeHtml(data.regFeeEur)}</b>`);
  }
  lines.push(`• 💳 <b>Totale ${isPaid ? 'Incassato' : 'Da Saldare'}:</b> <b>€${escapeHtml(data.totalEur)}</b>`);
  lines.push(`• Stato Pagamento: ${statusEmoji} <b>${escapeHtml(data.paymentStatusText)}</b>`);

  if (data.isPaidOnline && data.stripePaymentIntentId) {
    lines.push(`• Stripe Intent ID: <code>${escapeHtml(data.stripePaymentIntentId)}</code>`);
  }

  if (data.notes) {
    lines.push(``);
    lines.push(`📝 <b>Note del Cliente:</b>`);
    lines.push(`<i>"${escapeHtml(data.notes)}"</i>`);
  }

  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🆔 <b>ID Prenotazione:</b> <code>${escapeHtml(data.bookingId)}</code>`);

  const keyboard: Array<Array<{ text: string; url: string }>> = [];
  const actionRow: Array<{ text: string; url: string }> = [];

  if (whatsappUrl) {
    actionRow.push({ text: '💬 WhatsApp', url: whatsappUrl });
  }
  if (stripeDashboardUrl) {
    actionRow.push({ text: '💳 Stripe', url: stripeDashboardUrl });
  }
  actionRow.push({ text: '🌐 Admin CRM', url: adminCrmUrl });

  if (actionRow.length > 0) {
    keyboard.push(actionRow);
  }

  return sendTelegramMessage(lines.join('\n'), keyboard.length > 0 ? keyboard : undefined);
}

/**
 * Sends a contact form submission notification to the admin Telegram chat/channel.
 */
export async function sendTelegramContactNotification(data: ContactEmailTemplateData): Promise<boolean> {
  const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;

  const lines: string[] = [
    `✉️ <b>NUOVO MESSAGGIO DAL SITO WEB — ATENA SCHOOL</b>`,
    ``,
    `👤 <b>Da:</b> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`,
    `📧 <b>Email:</b> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>`,
    `📱 <b>Telefono:</b> ${escapeHtml(data.phone || 'Non indicato')}`,
    `🎯 <b>Interesse:</b> ${escapeHtml(data.interest || 'Informazioni Generali')}`,
    ``,
    `💬 <b>Messaggio:</b>`,
    `<i>"${escapeHtml(data.message || '(Nessun messaggio)')}"</i>`,
  ];

  const keyboard: Array<Array<{ text: string; url: string }>> = [];

  if (whatsappUrl) {
    keyboard.push([{ text: '💬 Contatta su WhatsApp', url: whatsappUrl }]);
  }

  return sendTelegramMessage(lines.join('\n'), keyboard.length > 0 ? keyboard : undefined);
}
