import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { TelegramService } from '../mail/telegram.service';
import {
  NotificationChannel,
  NotificationStatus,
  RecipientType,
} from '@atena/api-types';
import {
  matchesTriggerConditions,
  renderEmailFromBlocks,
  renderTelegramFromBlocks,
  compileTemplate,
  getFieldValue,
  DEFAULT_SCHOOL_PROFILE,
} from '@atena/core';

@Injectable()
export class NotificationTriggerEngineService {
  private readonly logger = new Logger(NotificationTriggerEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Universal event listener for all supported business domain events
   */
  @OnEvent('booking.created_stripe')
  async handleBookingCreatedStripe(payload: Record<string, any>) {
    await this.processEvent('booking.created_stripe', payload);
  }

  @OnEvent('booking.pending_cash')
  async handleBookingPendingCash(payload: Record<string, any>) {
    await this.processEvent('booking.pending_cash', payload);
  }

  @OnEvent('booking.cancelled')
  async handleBookingCancelled(payload: Record<string, any>) {
    await this.processEvent('booking.cancelled', payload);
  }

  @OnEvent('booking.rescheduled')
  async handleBookingRescheduled(payload: Record<string, any>) {
    await this.processEvent('booking.rescheduled', payload);
  }

  @OnEvent('booking.refunded')
  async handleBookingRefunded(payload: Record<string, any>) {
    await this.processEvent('booking.refunded', payload);
  }

  @OnEvent('contact_form.submitted')
  async handleContactFormSubmitted(payload: Record<string, any>) {
    await this.processEvent('contact_form.submitted', payload);
  }

  @OnEvent('payment.succeeded')
  async handlePaymentSucceeded(payload: Record<string, any>) {
    await this.processEvent('payment.succeeded', payload);
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(payload: Record<string, any>) {
    await this.processEvent('payment.failed', payload);
  }

  /**
   * Universal trigger execution dispatcher
   */
  async processEvent(eventKey: string, payload: Record<string, any>) {
    try {
      // 1. Find all active triggers for this event key
      const triggers = await this.prisma.notification_triggers.findMany({
        where: {
          eventKey,
          isActive: true,
        },
        include: {
          template: true,
        },
      });

      if (!triggers || triggers.length === 0) {
        return;
      }

      this.logger.log(`Processing event "${eventKey}" with ${triggers.length} active triggers`);

      const schoolProfile = payload.schoolProfile || (await this.getSchoolProfile());

      // 2. Evaluate and execute each trigger
      for (const trigger of triggers) {
        if (!trigger.template || !trigger.template.isActive) {
          continue;
        }

        // Check declarative JSON conditions
        const isMatched = matchesTriggerConditions(payload, trigger.conditions as any);
        if (!isMatched) {
          continue;
        }

        // Resolve destination recipient
        const recipient = this.resolveRecipient(trigger, payload, schoolProfile);
        if (!recipient) {
          this.logger.warn(`Trigger "${trigger.name}" skipped: unable to resolve recipient for recipientType ${trigger.recipientType}`);
          continue;
        }

        // Dispatch notification
        await this.dispatchNotification(trigger, recipient, { ...payload, schoolProfile });
      }
    } catch (err: any) {
      this.logger.error(`Error in NotificationTriggerEngine for event "${eventKey}": ${err.message}`, err.stack);
    }
  }

  private resolveRecipient(trigger: any, payload: Record<string, any>, schoolProfile?: any): string | null {
    if (trigger.customRecipient && trigger.customRecipient.trim()) {
      return trigger.customRecipient.trim();
    }

    const channel = Number(trigger.channel);
    const recipientType = Number(trigger.recipientType);

    if (channel === NotificationChannel.EMAIL) {
      if (recipientType === RecipientType.CUSTOMER) {
        return payload.purchaser_email || payload.email || payload.student_email || payload.purchaserEmail || null;
      }
      if (recipientType === RecipientType.ADMIN) {
        return (
          trigger.customRecipient?.trim() ||
          schoolProfile?.secretariat_email ||
          schoolProfile?.email ||
          process.env.ADMIN_EMAIL ||
          process.env.NOTIFICATION_ADMIN_EMAIL ||
          'info@atenaschool.com'
        );
      }
      if (recipientType === RecipientType.TEACHER) {
        return payload.teacher_email || payload.teacherEmail || getFieldValue(payload, 'course.teacher.email') || null;
      }
    }

    if (channel === NotificationChannel.TELEGRAM) {
      if (trigger.customRecipient && trigger.customRecipient.trim()) {
        return trigger.customRecipient.trim();
      }
      return process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || 'DEFAULT_ADMIN_CHAT';
    }

    return null;
  }

  private async getSchoolProfile(): Promise<any> {
    try {
      const profile = await this.prisma.schoolProfile.findFirst({
        orderBy: { isDefault: 'desc' },
      });
      if (profile) {
        return {
          ...DEFAULT_SCHOOL_PROFILE,
          id: profile.id,
          name: profile.name,
          legal_name: profile.legalName,
          tagline: profile.tagline,
          founders: profile.founders,
          logo_url: profile.logoUrl,
          website: profile.website,
          site_url: profile.siteUrl,
          app_url: profile.appUrl,
          admin_url: profile.adminUrl,
          address: profile.address,
          city: profile.city,
          cap: profile.cap,
          province: profile.province,
          country: profile.country,
          maps_url: profile.mapsUrl,
          phone: profile.phone,
          landline: profile.landline,
          whatsapp: profile.whatsapp,
          email: profile.email,
          secretariat_email: profile.secretariatEmail,
          support_email: profile.supportEmail,
          secretariat_hours: profile.secretariatHours,
          vat_code: profile.vatCode,
          registration_fee_enabled: profile.registrationFeeEnabled,
          registration_fee_eur: Number(profile.registrationFeeEur),
          academic_year: profile.academicYear,
          iban: profile.iban,
          bank_name: profile.bankName,
          account_holder: profile.accountHolder,
          socials: profile.socials as any,
        };
      }

      const setting = await this.prisma.appSetting.findUnique({
        where: { key: 'school_profile' },
      });
      if (setting?.value && typeof setting.value === 'object') {
        return { ...DEFAULT_SCHOOL_PROFILE, ...(setting.value as any) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SCHOOL_PROFILE;
  }

  private async dispatchNotification(
    trigger: any,
    recipient: string,
    payload: Record<string, any>
  ) {
    const isEmail = Number(trigger.channel) === NotificationChannel.EMAIL;
    const template = trigger.template;

    if (isEmail) {
      let subject = template.subject || 'Atena School';
      let html = template.bodyHtml || '';

      if (template.blocksConfig && template.blocksConfig.blocks?.length) {
        const schoolProfile = payload.schoolProfile || (await this.getSchoolProfile());
        const rendered = renderEmailFromBlocks(template.blocksConfig, payload, schoolProfile);
        subject = template.subject ? compileTemplate(template.subject, payload) : (rendered.subject || subject);
        html = rendered.html;
      } else {
        subject = compileTemplate(subject, payload);
        html = compileTemplate(template.bodyHtml || template.bodyText || '', payload);
      }

      try {
        const sendResult = await this.mailService.sendEmail(
          recipient,
          subject,
          template.bodyText ? compileTemplate(template.bodyText, payload) : subject,
          html,
          template.notificationType
        );

        await this.logExecution({
          channel: NotificationChannel.EMAIL,
          notificationType: template.notificationType,
          recipient,
          subject,
          notificationTriggerId: trigger.id,
          notificationTemplateId: template.id,
          request: { trigger_id: trigger.id, event_key: trigger.eventKey, payload },
          response: sendResult,
          status: sendResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        });
      } catch (sendErr: any) {
        await this.logExecution({
          channel: NotificationChannel.EMAIL,
          notificationType: template.notificationType,
          recipient,
          subject,
          notificationTriggerId: trigger.id,
          notificationTemplateId: template.id,
          request: { trigger_id: trigger.id, event_key: trigger.eventKey, payload },
          response: { error: sendErr.message },
          status: NotificationStatus.FAILED,
        });
      }
    } else {
      // Telegram
      let text = template.bodyText || '';

      if (template.blocksConfig && template.blocksConfig.blocks?.length) {
        const rendered = renderTelegramFromBlocks(template.blocksConfig, payload);
        text = rendered.text;
      } else {
        text = compileTemplate(text, payload);
      }

      try {
        const customChatId = recipient !== 'DEFAULT_ADMIN_CHAT' ? recipient : undefined;
        const sendResult = await this.telegramService.sendMessage(
          text,
          undefined,
          template.notificationType,
          customChatId
        );

        await this.logExecution({
          channel: NotificationChannel.TELEGRAM,
          notificationType: template.notificationType,
          recipient: recipient || 'Telegram Admin',
          subject: 'Telegram Bot Alert',
          notificationTriggerId: trigger.id,
          notificationTemplateId: template.id,
          request: { trigger_id: trigger.id, event_key: trigger.eventKey, payload },
          response: sendResult,
          status: sendResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        });
      } catch (sendErr: any) {
        await this.logExecution({
          channel: NotificationChannel.TELEGRAM,
          notificationType: template.notificationType,
          recipient: recipient || 'Telegram Admin',
          subject: 'Telegram Bot Alert',
          notificationTriggerId: trigger.id,
          notificationTemplateId: template.id,
          request: { trigger_id: trigger.id, event_key: trigger.eventKey, payload },
          response: { error: sendErr.message },
          status: NotificationStatus.FAILED,
        });
      }
    }
  }

  private async logExecution(params: {
    channel: number;
    notificationType: number;
    recipient: string;
    subject?: string;
    notificationTriggerId?: string | number | bigint;
    notificationTemplateId?: string | number | bigint;
    request: any;
    response: any;
    status: number;
  }) {
    const toBigInt = (val: any): bigint | null => {
      if (val === null || val === undefined || val === '') return null;
      try {
        return BigInt(val);
      } catch {
        return null;
      }
    };

    try {
      await this.prisma.notification_logs.create({
        data: {
          channel: params.channel,
          notificationType: params.notificationType,
          recipient: params.recipient,
          subject: params.subject || null,
          notificationTriggerId: toBigInt(params.notificationTriggerId),
          notificationTemplateId: toBigInt(params.notificationTemplateId),
          request: params.request,
          response: params.response || null,
          status: params.status,
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to log notification trigger execution: ${e.message}`);
    }
  }
}
