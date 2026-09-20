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
import { compileTemplate } from '@atena/core';
import { MailService } from '../mail/mail.service';
import { TelegramService } from '../mail/telegram.service';
import { UpdateNotificationTemplateDto, TestSendNotificationDto } from './dto/notification-template.dto';

const DEFAULT_SAMPLE_DATA: Record<string, any> = {
  student_name: 'Mario Rossi',
  course_name: 'Inglese Individuale B2',
  amount_paid: '€180.00',
  registration_fee: '€30.00',
  total_amount: '€210.00',
  lesson_schedule: 'Lunedì e Mercoledì 18:00 - 19:30',
  start_date: '01/10/2026',
  app_url: 'https://app.atenaschool.com',
  booking_id: 'BK-TEST-2026-999',
  sender_name: 'Giulia Bianchi',
  sender_email: 'giulia.bianchi@example.com',
  sender_phone: '+39 333 1234567',
  topic: 'Informazioni Corsi',
  message: 'Vorrei richiedere maggiori dettagli sulle certificazioni Cambridge.',
  payment_method: 'Carta di Credito (Stripe)',
  payment_status: 'Pagato Online',
  purchaser_name: 'Mario Rossi',
  purchaser_email: 'mario.rossi@example.com',
  purchaser_phone: '+39 333 9876543',
};

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

    let templates = (data || []) as NotificationTemplateRecord[];

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

    return data as NotificationTemplateRecord;
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
    if (dto.subject_template !== undefined) updatePayload.subject_template = dto.subject_template;
    if (dto.body_template !== undefined) updatePayload.body_template = dto.body_template;
    if (dto.is_active !== undefined) updatePayload.is_active = dto.is_active;

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

    return data as NotificationTemplateRecord;
  }

  async testSend(
    id: string,
    dto: TestSendNotificationDto,
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const template = await this.getTemplateById(id);

    const sampleData = {
      ...DEFAULT_SAMPLE_DATA,
      ...(dto.sample_data || {}),
    };

    const subjectTemplate = dto.subject_template ?? template.subject_template ?? 'Test Notifica Atena School';
    const bodyTemplate = dto.body_template ?? template.body_template;

    const compiledSubject = compileTemplate(subjectTemplate, sampleData);
    const compiledBody = compileTemplate(bodyTemplate, sampleData);

    const recipient = (dto.recipient || '').trim();
    if (!recipient) {
      throw new BadRequestException('Destinatario mancante (email o chat_id)');
    }

    if (template.channel === NotificationChannel.EMAIL) {
      const emailRes = await this.mailService.sendEmail(
        recipient,
        `[TEST] ${compiledSubject}`,
        compiledBody,
        compiledBody,
        template.notification_type || NotificationType.BOOKING_CONFIRMATION,
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
      const tgRes = await this.telegramService.sendMessage(
        `<b>[TEST NOTIFICA ATENA SCHOOL]</b>\n\n${compiledBody}`,
        undefined,
        template.notification_type || NotificationType.BOOKING_CONFIRMATION,
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
}
