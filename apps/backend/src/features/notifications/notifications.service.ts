import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  NotificationChannel,
  NotificationType,
  NotificationStatus,
  RecipientType,
  NotificationTemplateRecord,
} from '@atena/api-types';
import {
  compileTemplate,
  getDefaultBlocksForTemplate,
  renderEmailFromBlocks,
  renderTelegramFromBlocks,
} from '@atena/core';
import { MailService } from '../mail/mail.service';
import { TelegramService } from '../mail/telegram.service';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  TestSendNotificationDto,
} from './dto/notification-template.dto';

const BOOKING_SAMPLE_DATA: Record<string, any> = {
  student_name: 'Viktoria Petukhova',
  purchaser_name: 'Petukhov Andrii',
  course_name: 'Kids (6-7 anni)',
  amount_paid: '103.20',
  registration_fee: '30.00',
  total_amount: '103.20',
  course_price: '73.20',
  lesson_schedule: 'Martedì e Giovedì 17:00-18:00',
  schedule_text: 'Martedì e Giovedì 17:00-18:00',
  start_date: '2026-10-06',
  date: '2026-10-06',
  student_birth_date: '2005-12-02',
  birth_place: 'Cittanova RC',
  student_birth_place: 'Cittanova RC',
  app_url: 'https://app.atenaschool.com',
  dashboard_url: 'https://app.atenaschool.com',
  admin_url: 'https://admin.atenaschool.com',
  booking_id: '10bde731-f620-4e16-a240-63bb08b86d70',
  payment_method: 'Contanti / Saldo in Sede',
  payment_method_label: 'Saldo in Sede',
  payment_status: 'In attesa di saldo',
  payment_status_label: '⏳ Saldo in Sede',
};

const CONTACT_SAMPLE_DATA: Record<string, any> = {
  sender_name: 'Mario Rossi',
  sender_email: 'mario.rossi@example.com',
  sender_phone: '+39 347 1234567',
  interest: 'Corso di Inglese Adulti',
  topic: 'Richiesta Informazioni',
  message: 'Buongiorno, vorrei avere informazioni sui corsi di inglese per adulti disponibili.',
  message_body: 'Buongiorno, vorrei avere informazioni sui corsi di inglese per adulti disponibili.',
  admin_url: 'https://admin.atenaschool.com',
};

function getSampleDataForTemplate(code: string): Record<string, any> {
  if (code.includes('contact') || code.includes('lead')) {
    return CONTACT_SAMPLE_DATA;
  }
  return BOOKING_SAMPLE_DATA;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private mailService: MailService,
    private telegramService: TelegramService,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      '';

    this.supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  private normalizeTemplate(t: any): NotificationTemplateRecord {
    const channel: NotificationChannel =
      Number(t.channel) === NotificationChannel.TELEGRAM
        ? NotificationChannel.TELEGRAM
        : NotificationChannel.EMAIL;
    const blocksConfig = t.blocks_config || getDefaultBlocksForTemplate(t.code, channel);

    return {
      ...t,
      channel,
      notification_type: Number(t.notification_type) || NotificationType.BOOKING_CONFIRMATION,
      recipient_type: Number(t.recipient_type) || RecipientType.CUSTOMER,
      subject: t.subject || t.subject_template || null,
      subject_template: t.subject || t.subject_template || null,
      body_html: t.body_html || t.body_template || null,
      body_text: t.body_text || t.body_template || null,
      body_template: t.body_html || t.body_text || t.body_template || '',
      blocks_config: blocksConfig,
    };
  }

  async getTemplates(filters?: {
    channel?: number;
    recipient_type?: number;
    search?: string;
  }): Promise<NotificationTemplateRecord[]> {
    let query = this.supabase
      .from('notification_templates')
      .select('*')
      .order('channel', { ascending: true })
      .order('recipient_type', { ascending: true })
      .order('code', { ascending: true });

    if (filters?.channel) {
      query = query.eq('channel', Number(filters.channel));
    }
    if (filters?.recipient_type) {
      query = query.eq('recipient_type', Number(filters.recipient_type));
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error(`Error fetching notification templates: ${error.message}`);
      throw new BadRequestException(`Errore caricamento template: ${error.message}`);
    }

    let templates = (data || []).map((t) => this.normalizeTemplate(t));

    if (filters?.search && filters.search.trim() !== '') {
      const s = filters.search.trim().toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.code.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s)),
      );
    }

    return templates;
  }

  async getTemplateById(id: string): Promise<NotificationTemplateRecord> {
    const { data, error } = await this.supabase
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Template non trovato con ID: ${id}`);
    }

    return this.normalizeTemplate(data);
  }

  async updateTemplate(
    id: string,
    dto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateRecord> {
    const existing = await this.getTemplateById(id);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.is_active !== undefined) updatePayload.is_active = dto.is_active;

    // Handle blocks config compilation
    if (dto.blocks_config) {
      updatePayload.blocks_config = dto.blocks_config;

      if (existing.channel === NotificationChannel.EMAIL) {
        const compiled = renderEmailFromBlocks(dto.blocks_config, getSampleDataForTemplate(existing.code));
        updatePayload.body_html = compiled.html;
        if (dto.subject || dto.subject_template) {
          updatePayload.subject = dto.subject || dto.subject_template;
        } else {
          updatePayload.subject = compiled.subject;
        }
      } else {
        const compiled = renderTelegramFromBlocks(dto.blocks_config, getSampleDataForTemplate(existing.code));
        updatePayload.body_text = compiled.text;
      }
    } else {
      if (dto.subject !== undefined) updatePayload.subject = dto.subject;
      if (dto.subject_template !== undefined) updatePayload.subject = dto.subject_template;
      if (dto.body_html !== undefined) updatePayload.body_html = dto.body_html;
      if (dto.body_text !== undefined) updatePayload.body_text = dto.body_text;
      if (dto.body_template !== undefined) {
        if (existing.channel === NotificationChannel.EMAIL) {
          updatePayload.body_html = dto.body_template;
        } else {
          updatePayload.body_text = dto.body_template;
        }
      }
    }

    const { data, error } = await this.supabase
      .from('notification_templates')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      this.logger.error(`Error updating template ${id}: ${error?.message}`);
      throw new BadRequestException(`Impossibile aggiornare il template: ${error?.message}`);
    }

    return this.normalizeTemplate(data);
  }

  async createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplateRecord> {
    const rawCode = (dto.code || dto.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_');

    // Check unique code
    const { data: existing } = await this.supabase
      .from('notification_templates')
      .select('id')
      .eq('code', rawCode)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Un template con il codice '${rawCode}' esiste già.`);
    }

    const channel = (Number(dto.channel) || NotificationChannel.EMAIL) as NotificationChannel;
    const notificationType = (Number(dto.notification_type) || NotificationType.BOOKING_CONFIRMATION) as NotificationType;
    const recipientType = (Number(dto.recipient_type) || RecipientType.CUSTOMER) as RecipientType;

    const blocksConfig = dto.blocks_config?.blocks?.length
      ? dto.blocks_config
      : getDefaultBlocksForTemplate(rawCode, channel);

    let subject = dto.subject || dto.subject_template || (channel === NotificationChannel.EMAIL ? `Notifica: ${dto.name}` : '');
    let bodyHtml = dto.body_html || '';
    let bodyText = dto.body_text || '';

    if (channel === NotificationChannel.EMAIL) {
      const compiled = renderEmailFromBlocks(blocksConfig, getSampleDataForTemplate(rawCode));
      bodyHtml = bodyHtml || compiled.html;
      subject = subject || compiled.subject;
    } else {
      const compiled = renderTelegramFromBlocks(blocksConfig, getSampleDataForTemplate(rawCode));
      bodyText = bodyText || compiled.text;
    }

    const insertPayload: Record<string, any> = {
      code: rawCode,
      name: dto.name,
      description: dto.description || null,
      channel,
      notification_type: notificationType,
      recipient_type: recipientType,
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
      blocks_config: blocksConfig,
      available_variables: ['student_name', 'course_name', 'total_amount', 'purchaser_name', 'date', 'lesson_schedule'],
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    };

    const { data, error } = await this.supabase
      .from('notification_templates')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      this.logger.error(`Error creating template: ${error?.message}`);
      throw new BadRequestException(`Impossibile creare il template: ${error?.message}`);
    }

    return this.normalizeTemplate(data);
  }

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    const { data: existing } = await this.supabase
      .from('notification_templates')
      .select('code, name')
      .eq('id', id)
      .maybeSingle();

    const SYSTEM_CODES = [
      'booking_confirmation_client',
      'booking_alert_admin',
      'contact_lead_admin',
      'membership_card_client',
      'payment_reminder_client',
    ];

    if (existing && SYSTEM_CODES.includes(existing.code)) {
      throw new BadRequestException(
        `Il modello '${existing.name}' (${existing.code}) è un template di sistema fondamentale e non può essere eliminato.`
      );
    }

    const { error } = await this.supabase
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Error deleting template ${id}: ${error.message}`);
      throw new BadRequestException(`Impossibile eliminare il template: ${error.message}`);
    }

    return { success: true };
  }

  async testSend(
    id: string,
    dto: TestSendNotificationDto,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const template = await this.getTemplateById(id);

    const sampleData = {
      ...getSampleDataForTemplate(template.code),
      ...(dto.sample_data || {}),
    };

    const recipient = (dto.recipient || '').trim();
    if (!recipient) {
      throw new BadRequestException('Destinatario mancante (email o chat_id)');
    }

    if (template.channel === NotificationChannel.EMAIL) {
      let subject = dto.subject || dto.subject_template || template.subject || 'Test Notifica Atena School';
      let htmlBody = dto.body_html || dto.body_template;

      // Determine which blocks to use: explicit dto blocks -> saved template blocks -> default template blocks
      const blocksConfig = dto.blocks_config?.blocks?.length
        ? dto.blocks_config
        : (template.blocks_config?.blocks?.length
            ? template.blocks_config
            : (!htmlBody ? getDefaultBlocksForTemplate(template.code, NotificationChannel.EMAIL) : null));

      if (blocksConfig) {
        const compiled = renderEmailFromBlocks(blocksConfig, sampleData);
        htmlBody = compiled.html;
        if (!dto.subject && !dto.subject_template) {
          subject = template.subject ? compileTemplate(template.subject, sampleData) : compiled.subject;
        }
      }

      const compiledSubject = compileTemplate(subject, sampleData);
      const compiledHtml = compileTemplate(htmlBody || '', sampleData);

      const emailRes = await this.mailService.sendEmail(
        recipient,
        `[TEST] ${compiledSubject}`,
        compiledHtml,
        compiledHtml,
        template.notification_type || NotificationType.BOOKING_CONFIRMATION,
        { notificationTemplateId: template.id },
      );

      if (!emailRes.success) {
        throw new BadRequestException(`Invio email fallito: ${emailRes.error}`);
      }

      return {
        success: true,
        message: `Email di test inviata con successo a ${recipient}`,
        details: emailRes,
      };
    } else if (template.channel === NotificationChannel.TELEGRAM) {
      let tgText = dto.body_text || dto.body_template;

      const blocksConfig = dto.blocks_config?.blocks?.length
        ? dto.blocks_config
        : (template.blocks_config?.blocks?.length
            ? template.blocks_config
            : (!tgText ? getDefaultBlocksForTemplate(template.code, NotificationChannel.TELEGRAM) : null));

      if (blocksConfig) {
        const compiled = renderTelegramFromBlocks(blocksConfig, sampleData);
        tgText = compiled.text;
      }

      const compiledBody = compileTemplate(tgText || '', sampleData);
      const customChat = recipient && (recipient.startsWith('-') || /^\d+$/.test(recipient) || recipient.startsWith('@'))
        ? recipient
        : undefined;

      const tgRes = await this.telegramService.sendMessage(
        `<b>[TEST NOTIFICA ATENA SCHOOL]</b>\n\n${compiledBody}`,
        undefined,
        template.notification_type || NotificationType.BOOKING_CONFIRMATION,
        customChat,
        { notificationTemplateId: template.id },
      );

      if (!tgRes.success) {
        throw new BadRequestException(`Invio Telegram fallito: ${tgRes.error}`);
      }

      return {
        success: true,
        message: `Messaggio Telegram di test inviato con successo`,
        details: tgRes,
      };
    }

    throw new BadRequestException(`Canale di notifica sconosciuto: ${template.channel}`);
  }

  async getLogs(filters?: {
    page?: number;
    limit?: number;
    channel?: number;
    status?: number;
    search?: string;
    notification_trigger_id?: string;
    notification_template_id?: string;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 20));
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('notification_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.channel) {
      query = query.eq('channel', Number(filters.channel));
    }
    if (filters?.status) {
      query = query.eq('status', Number(filters.status));
    }
    if (filters?.notification_trigger_id) {
      query = query.eq('notification_trigger_id', filters.notification_trigger_id);
    }
    if (filters?.notification_template_id) {
      query = query.eq('notification_template_id', filters.notification_template_id);
    }
    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(`recipient.ilike.%${s}%,subject.ilike.%${s}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      this.logger.error(`Failed to fetch notification logs: ${error.message}`);
      throw new BadRequestException(`Errore caricamento log: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  }
}


