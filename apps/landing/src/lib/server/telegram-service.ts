import { BookingEmailTemplateData, ContactEmailTemplateData } from './email-templates';

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
export async function sendTelegramMessage(htmlText: string, inlineKeyboard?: Array<Array<{ text: string; url: string }>>): Promise<boolean> {
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
      return false;
    }

    const data = await response.json().catch(() => ({}));
    console.log('[TELEGRAM SUCCESS] Sent notification (Msg ID:', (data as { result?: { message_id?: number } }).result?.message_id, ')');
    return true;
  } catch (err) {
    console.error('[TELEGRAM NETWORK ERROR]:', err);
    return false;
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

  const lines: string[] = [
    `🚨 <b>NUOVA ISCRIZIONE CORSO — ATENA SCHOOL</b>`,
    ``,
    `📚 <b>Corso:</b> ${escapeHtml(data.courseName)}`,
    `🗓 <b>Data inizio:</b> ${escapeHtml(data.date || 'Da concordare con la segreteria')}`,
    `⏰ <b>Orario:</b> ${escapeHtml(data.lessonSchedule || data.time || 'N/D')}`,
    `🏛 <b>Sede:</b> In Presenza (Cittanova)`,
    ``,
    `👤 <b>Acquirente:</b> ${escapeHtml(data.purchaserName)}`,
    `📧 <b>Email:</b> <a href="mailto:${escapeHtml(data.purchaserEmail)}">${escapeHtml(data.purchaserEmail)}</a>`,
    `📱 <b>Telefono:</b> ${escapeHtml(data.purchaserPhone || 'N/D')}`,
    `🧾 <b>Codice Fiscale:</b> <code>${escapeHtml(data.purchaserTaxCode || 'N/D')}</code>`,
  ];

  if (data.needsCompanyInvoice) {
    lines.push(`💼 <b>Fattura Aziendale:</b> PEC <code>${escapeHtml(data.pecEmail)}</code> • SDI <code>${escapeHtml(data.sdiCode)}</code>`);
  }

  if (data.isForChild) {
    lines.push(``);
    lines.push(`👶 <b>Dati Studente (Minore):</b>`);
    lines.push(`• Nome: <b>${escapeHtml(data.studentName)}</b>`);
    lines.push(`• Codice Fiscale: <code>${escapeHtml(data.studentTaxCode || 'N/D')}</code>`);
    if (data.studentBirthDate) {
      lines.push(`• Data di Nascita: ${escapeHtml(data.studentBirthDate)}`);
    }
  }

  lines.push(``);
  lines.push(`💰 <b>Riepilogo Economico:</b>`);
  lines.push(`• Quota Corso: €${escapeHtml(data.courseFeeEur || '0.00')}`);
  if (Number(data.regFeeEur) > 0) {
    lines.push(`• Quota Iscrizione Annuale: €${escapeHtml(data.regFeeEur)}`);
  }
  lines.push(`• <b>Totale ${isPaid ? 'Incassato' : 'Da Saldare'}:</b> <b>€${escapeHtml(data.totalEur)}</b>`);
  lines.push(`• Stato: ${statusEmoji} <b>${escapeHtml(data.paymentStatusText)}</b>`);

  if (data.isPaidOnline && data.stripePaymentIntentId) {
    lines.push(`• Stripe Intent: <code>${escapeHtml(data.stripePaymentIntentId)}</code>`);
  }

  if (data.notes) {
    lines.push(``);
    lines.push(`📝 <b>Note cliente:</b> <i>"${escapeHtml(data.notes)}"</i>`);
  }

  lines.push(``);
  lines.push(`🆔 <b>ID Prenotazione:</b> <code>${escapeHtml(data.bookingId)}</code>`);

  const keyboard: Array<Array<{ text: string; url: string }>> = [];
  const actionRow: Array<{ text: string; url: string }> = [];

  if (whatsappUrl) {
    actionRow.push({ text: '💬 WhatsApp', url: whatsappUrl });
  }
  if (stripeDashboardUrl) {
    actionRow.push({ text: '💳 Stripe Dashboard', url: stripeDashboardUrl });
  }

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
