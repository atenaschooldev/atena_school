import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TelegramButton {
  text: string;
  url: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  private escapeHtml(text?: string | null): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async sendMessage(htmlText: string, inlineKeyboard?: TelegramButton[][]): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      this.logger.warn('[TELEGRAM SKIPPED]: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
      return { success: false, error: 'Telegram credentials not configured' };
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { ok: boolean; result?: { message_id?: number }; description?: string };

      if (!response.ok || !data.ok) {
        this.logger.error(`[TELEGRAM ERROR]: ${data.description || response.statusText}`);
        return { success: false, error: data.description || 'Failed to send message' };
      }

      this.logger.log(`[TELEGRAM SUCCESS]: Notification sent, Msg ID: ${data.result?.message_id}`);
      return { success: true, messageId: data.result?.message_id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[TELEGRAM NETWORK ERROR]: ${msg}`);
      return { success: false, error: msg };
    }
  }

  async sendBookingNotification(data: {
    courseName: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserPhone?: string;
    purchaserTaxCode?: string;
    studentName?: string;
    studentTaxCode?: string;
    studentBirthDate?: string;
    isForChild?: boolean;
    date?: string;
    time?: string;
    lessonSchedule?: string;
    totalEur: string | number;
    courseFeeEur?: string | number;
    regFeeEur?: string | number;
    isPaidOnline?: boolean;
    paymentStatusText: string;
    bookingId: string;
    notes?: string;
    stripePaymentIntentId?: string;
    stripeDashboardUrl?: string;
  }): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const isPaid = Boolean(data.isPaidOnline);
    const statusEmoji = isPaid ? '✅' : '⏳';
    const cleanPhone = (data.purchaserPhone || '').replace(/[^0-9+]/g, '');
    const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
    const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;
    const stripeDashboardUrl = data.stripeDashboardUrl || (data.stripePaymentIntentId ? `https://dashboard.stripe.com/payments/${data.stripePaymentIntentId}` : null);

    const lines: string[] = [
      `🚨 <b>NUOVA ISCRIZIONE CORSO — ATENA SCHOOL</b>`,
      ``,
      `📚 <b>Corso:</b> ${this.escapeHtml(data.courseName)}`,
      `🗓 <b>Data inizio:</b> ${this.escapeHtml(data.date || 'Da concordare con la segreteria')}`,
      `⏰ <b>Orario:</b> ${this.escapeHtml(data.lessonSchedule || data.time || 'N/D')}`,
      `🏛 <b>Sede:</b> In Presenza (Cittanova)`,
      ``,
      `👤 <b>Acquirente:</b> ${this.escapeHtml(data.purchaserName)}`,
      `📧 <b>Email:</b> <a href="mailto:${this.escapeHtml(data.purchaserEmail)}">${this.escapeHtml(data.purchaserEmail)}</a>`,
      `📱 <b>Telefono:</b> ${this.escapeHtml(data.purchaserPhone || 'N/D')}`,
      `🧾 <b>Codice Fiscale:</b> <code>${this.escapeHtml(data.purchaserTaxCode || 'N/D')}</code>`,
    ];

    if (data.isForChild) {
      lines.push(``);
      lines.push(`👶 <b>Dati Studente (Minore):</b>`);
      lines.push(`• Nome: <b>${this.escapeHtml(data.studentName)}</b>`);
      lines.push(`• Codice Fiscale: <code>${this.escapeHtml(data.studentTaxCode || 'N/D')}</code>`);
      if (data.studentBirthDate) {
        lines.push(`• Data di Nascita: ${this.escapeHtml(data.studentBirthDate)}`);
      }
    }

    lines.push(``);
    lines.push(`💰 <b>Riepilogo Economico:</b>`);
    lines.push(`• Quota Corso: €${this.escapeHtml(String(data.courseFeeEur || '0.00'))}`);
    if (Number(data.regFeeEur) > 0) {
      lines.push(`• Quota Iscrizione Annuale: €${this.escapeHtml(String(data.regFeeEur))}`);
    }
    lines.push(`• <b>Totale ${isPaid ? 'Incassato' : 'Da Saldare'}:</b> <b>€${this.escapeHtml(String(data.totalEur))}</b>`);
    lines.push(`• Stato: ${statusEmoji} <b>${this.escapeHtml(data.paymentStatusText)}</b>`);

    if (isPaid && data.stripePaymentIntentId) {
      lines.push(`• Stripe Intent: <code>${this.escapeHtml(data.stripePaymentIntentId)}</code>`);
    }

    if (data.notes) {
      lines.push(``);
      lines.push(`📝 <b>Note cliente:</b> <i>"${this.escapeHtml(data.notes)}"</i>`);
    }

    lines.push(``);
    lines.push(`🆔 <b>ID Prenotazione:</b> <code>${this.escapeHtml(data.bookingId)}</code>`);

    const keyboard: TelegramButton[][] = [];
    const actionRow: TelegramButton[] = [];

    if (whatsappUrl) {
      actionRow.push({ text: '💬 WhatsApp', url: whatsappUrl });
    }
    if (stripeDashboardUrl) {
      actionRow.push({ text: '💳 Stripe Dashboard', url: stripeDashboardUrl });
    }

    if (actionRow.length > 0) {
      keyboard.push(actionRow);
    }

    return this.sendMessage(lines.join('\n'), keyboard.length > 0 ? keyboard : undefined);
  }

  async sendContactNotification(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    interest?: string;
    message: string;
  }): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
    const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
    const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;

    const lines: string[] = [
      `✉️ <b>NUOVO MESSAGGIO DAL SITO WEB — ATENA SCHOOL</b>`,
      ``,
      `👤 <b>Da:</b> ${this.escapeHtml(data.firstName)} ${this.escapeHtml(data.lastName)}`,
      `📧 <b>Email:</b> <a href="mailto:${this.escapeHtml(data.email)}">${this.escapeHtml(data.email)}</a>`,
      `📱 <b>Telefono:</b> ${this.escapeHtml(data.phone || 'Non indicato')}`,
      `🎯 <b>Interesse:</b> ${this.escapeHtml(data.interest || 'Informazioni Generali')}`,
      ``,
      `💬 <b>Messaggio:</b>`,
      `<i>"${this.escapeHtml(data.message || '(Nessun messaggio)')}"</i>`,
    ];

    const keyboard: TelegramButton[][] = [];
    if (whatsappUrl) {
      keyboard.push([{ text: '💬 Contatta su WhatsApp', url: whatsappUrl }]);
    }

    return this.sendMessage(lines.join('\n'), keyboard.length > 0 ? keyboard : undefined);
  }
}
