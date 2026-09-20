import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationChannel, NotificationStatus, NotificationType } from '@atena/api-types';
import { DEFAULT_SCHOOL_PROFILE, getTelegramCredentials } from '@atena/core';

export interface TelegramButton {
  text: string;
  url: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private escapeHtml(text?: string | null): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async sendMessage(
    htmlText: string,
    inlineKeyboard?: TelegramButton[][],
    notificationType: number = NotificationType.BOOKING_CONFIRMATION,
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const creds = await getTelegramCredentials();
    const botToken = creds.botToken || this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = creds.chatId || this.configService.get<string>('TELEGRAM_CHAT_ID');

    // Extract all target chat IDs (multi-admin support)
    const targetChats: string[] = [];
    if (creds.chatIds && creds.chatIds.length > 0) {
      for (const c of creds.chatIds) {
        const parts = String(c).split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
        targetChats.push(...parts);
      }
    }
    if (chatId) {
      const parts = String(chatId).split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
      targetChats.push(...parts);
    }
    const uniqueChats = Array.from(new Set(targetChats));

    if (!botToken || uniqueChats.length === 0) {
      this.logger.warn('[TELEGRAM SKIPPED]: TELEGRAM_BOT_TOKEN or CHAT_ID is not configured');
      return { success: false, error: 'Telegram credentials not configured' };
    }

    let lastResult: { success: boolean; messageId?: number; error?: string } = {
      success: false,
      error: 'Failed to send to Telegram recipient(s)',
    };
    let successCount = 0;

    for (const recipient of uniqueChats) {
      const payload: Record<string, unknown> = {
        chat_id: recipient,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };

      if (inlineKeyboard && inlineKeyboard.length > 0) {
        payload.reply_markup = {
          inline_keyboard: inlineKeyboard,
        };
      }

      let result: { success: boolean; messageId?: number; error?: string };

      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { ok: boolean; result?: { message_id?: number }; description?: string };

        if (!response.ok || !data.ok) {
          this.logger.error(`[TELEGRAM ERROR]: ${data.description || response.statusText}`);
          result = { success: false, error: data.description || 'Failed to send message' };
        } else {
          successCount++;
          this.logger.log(`[TELEGRAM SUCCESS]: Notification sent to ${recipient}, Msg ID: ${data.result?.message_id}`);
          result = { success: true, messageId: data.result?.message_id };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`[TELEGRAM NETWORK ERROR]: ${msg}`);
        result = { success: false, error: msg };
      }

      lastResult = result;

      // Async log to notification_logs
      this.prisma.notification_logs.create({
        data: {
          channel: NotificationChannel.TELEGRAM,
          notificationType,
          recipient,
          subject: 'Telegram Bot Alert',
          request: payload as any,
          response: result as any,
          status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        },
      }).catch(() => null);
    }

    if (successCount > 0) {
      return { success: true, messageId: lastResult.messageId };
    }

    return lastResult;
  }


  private formatDisplayDate(dateStr?: string | null): string {
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

  private formatBirthDate(dateStr?: string | null): string {
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

  async sendBookingNotification(data: {
    courseName: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserPhone?: string;
    purchaserTaxCode?: string;
    studentName?: string;
    studentTaxCode?: string;
    studentBirthDate?: string;
    studentEmail?: string;
    studentPhone?: string;
    isForChild?: boolean;
    needsCompanyInvoice?: boolean;
    pecEmail?: string;
    sdiCode?: string;
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
    const creds = await getTelegramCredentials();
    if (creds.notifyBookings === false) {
      this.logger.log('[TELEGRAM FILTERED]: notifyBookings is disabled in integration settings');
      return { success: true };
    }
    if (data.isPaidOnline && creds.notifyPayments === false) {
      this.logger.log('[TELEGRAM FILTERED]: notifyPayments is disabled in integration settings');
      return { success: true };
    }
    if (!data.isPaidOnline && creds.notifyCash === false) {
      this.logger.log('[TELEGRAM FILTERED]: notifyCash is disabled in integration settings');
      return { success: true };
    }

    const isPaid = Boolean(data.isPaidOnline);
    const statusEmoji = isPaid ? '✅' : '⏳';
    const cleanPhone = (data.purchaserPhone || '').replace(/[^0-9+]/g, '');
    const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : (cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`);
    const whatsappUrl = cleanPhone ? `https://wa.me/${waNumber}` : null;
    const stripeDashboardUrl = data.stripeDashboardUrl || (data.stripePaymentIntentId ? `https://dashboard.stripe.com/payments/${data.stripePaymentIntentId}` : null);
    const adminCrmUrl = this.configService.get<string>('ADMIN_URL') || 'https://atena-school-admin.vercel.app';

    const startDateFormatted = this.formatDisplayDate(data.date);
    const birthDateFormatted = this.formatBirthDate(data.studentBirthDate);
    const scheduleFormatted = data.lessonSchedule && data.lessonSchedule !== 'N/D' && data.lessonSchedule !== 'Da concordare'
      ? data.lessonSchedule
      : (data.time || 'Da concordare con la segreteria');

    const lines: string[] = [
      `🏛️ <b>NUOVA ISCRIZIONE — ${DEFAULT_SCHOOL_PROFILE.name.toUpperCase()}</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📚 <b>Corso:</b> ${this.escapeHtml(data.courseName)}`,
      `🗓 <b>Data di Inizio:</b> <code>${this.escapeHtml(startDateFormatted)}</code>`,
      `⏰ <b>Orario & Giorni:</b> ${this.escapeHtml(scheduleFormatted)}`,
      `📍 <b>Sede:</b> In Presenza (${DEFAULT_SCHOOL_PROFILE.city})`,
      ``,
      `👤 <b>ACQUIRENTE / GENITORE:</b>`,
      `• Nome: <b>${this.escapeHtml(data.purchaserName)}</b>`,
      `• 📧 Email: <a href="mailto:${this.escapeHtml(data.purchaserEmail)}">${this.escapeHtml(data.purchaserEmail)}</a>`,
      `• 📱 Telefono: <code>${this.escapeHtml(data.purchaserPhone || 'Non indicato')}</code>`,
      `• 🧾 Codice Fiscale: <code>${this.escapeHtml(data.purchaserTaxCode || 'Non indicato')}</code>`,
    ];

    if (data.needsCompanyInvoice) {
      lines.push(`• 💼 Fattura Elettronica: PEC <code>${this.escapeHtml(data.pecEmail || 'N/D')}</code> • SDI <code>${this.escapeHtml(data.sdiCode || 'N/D')}</code>`);
    }

    if (data.isForChild) {
      lines.push(``);
      lines.push(`👶 <b>DATI STUDENTE (MINORE):</b>`);
      lines.push(`• Nome: <b>${this.escapeHtml(data.studentName)}</b>`);
      if (birthDateFormatted) {
        lines.push(`• 🎂 Data di Nascita: <code>${this.escapeHtml(birthDateFormatted)}</code>`);
      }
      lines.push(`• 🧾 Codice Fiscale: <code>${this.escapeHtml(data.studentTaxCode || 'Non indicato')}</code>`);
      if (data.studentEmail) {
        lines.push(`• 📧 Email Studente: <a href="mailto:${this.escapeHtml(data.studentEmail)}">${this.escapeHtml(data.studentEmail)}</a>`);
      }
      if (data.studentPhone) {
        lines.push(`• 📱 Tel Studente: <code>${this.escapeHtml(data.studentPhone)}</code>`);
      }
    }

    lines.push(``);
    lines.push(`💶 <b>RIEPILOGO ECONOMICO:</b>`);
    lines.push(`• Quota Corso: <b>€${this.escapeHtml(String(data.courseFeeEur || '0.00'))}</b>`);
    if (Number(data.regFeeEur) > 0) {
      lines.push(`• Quota Associativa Annuale: <b>€${this.escapeHtml(String(data.regFeeEur))}</b>`);
    }
    lines.push(`• 💳 <b>Totale ${isPaid ? 'Incassato' : 'Da Saldare'}:</b> <b>€${this.escapeHtml(String(data.totalEur))}</b>`);
    lines.push(`• Stato Pagamento: ${statusEmoji} <b>${this.escapeHtml(data.paymentStatusText)}</b>`);

    if (isPaid && data.stripePaymentIntentId) {
      lines.push(`• Stripe Intent ID: <code>${this.escapeHtml(data.stripePaymentIntentId)}</code>`);
    }

    if (data.notes) {
      lines.push(``);
      lines.push(`📝 <b>Note del Cliente:</b>`);
      lines.push(`<i>"${this.escapeHtml(data.notes)}"</i>`);
    }

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🆔 <b>ID Prenotazione:</b> <code>${this.escapeHtml(data.bookingId)}</code>`);

    const keyboard: TelegramButton[][] = [];
    const actionRow: TelegramButton[] = [];

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
    const creds = await getTelegramCredentials();
    if (creds.notifyLeads === false) {
      this.logger.log('[TELEGRAM FILTERED]: notifyLeads is disabled in integration settings');
      return { success: true };
    }

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
