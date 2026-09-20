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
   * Listen to all system events matching wildcard patterns
   */
  @OnEvent('booking.*')
  async handleBookingEvent(payload: Record<string, any>) {
    await this.processEvent('booking.created_stripe', payload);
  }

  @OnEvent('booking.pending_cash')
  async handleCashBookingEvent(payload: Record<string, any>) {
    await this.processEvent('booking.pending_cash', payload);
  }

  @OnEvent('contact_form.*')
  async handleContactFormEvent(payload: Record<string, any>) {
    await this.processEvent('contact_form.submitted', payload);
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
        const recipient = this.resolveRecipient(trigger, payload);
        if (!recipient) {
          this.logger.warn(`Trigger "${trigger.name}" skipped: unable to resolve recipient.`);
          continue;
        }

        // Dispatch notification
        await this.dispatchNotification(trigger, recipient, payload);
      }
    } catch (err: any) {
      this.logger.error(`Error in NotificationTriggerEngine for event "${eventKey}": ${err.message}`, err.stack);
    }
  }

  private resolveRecipient(trigger: any, payload: Record<string, any>): string | null {
    if (trigger.customRecipient && trigger.customRecipient.trim()) {
      return trigger.customRecipient.trim();
    }

    if (trigger.channel === NotificationChannel.EMAIL) {
      if (trigger.recipientType === RecipientType.CUSTOMER || trigger.recipientType === 3) {
        return payload.purchaser_email || payload.email || payload.student_email || null;
      }
      if (trigger.recipientType === RecipientType.ADMIN) {
        return process.env.NOTIFICATION_ADMIN_EMAIL || 'atenaschool20@gmail.com';
      }
    }

    if (trigger.channel === NotificationChannel.TELEGRAM) {
      return process.env.TELEGRAM_ADMIN_CHAT_ID || 'DEFAULT_ADMIN_CHAT';
    }

    return null;
  }

  private async dispatchNotification(
    trigger: any,
    recipient: string,
    payload: Record<string, any>
  ) {
    const isEmail = trigger.channel === NotificationChannel.EMAIL;
    const template = trigger.template;

    if (isEmail) {
      let subject = template.subject || 'Atena School';
      let html = template.bodyHtml || '';

      if (template.blocksConfig && template.blocksConfig.blocks?.length) {
        const rendered = renderEmailFromBlocks(template.blocksConfig, payload, DEFAULT_SCHOOL_PROFILE);
        subject = rendered.subject || subject;
        html = rendered.html;
      } else {
        // Simple mustache replacement fallback
        for (const [k, v] of Object.entries(payload)) {
          const regex = new RegExp(`{{${k}}}`, 'g');
          subject = subject.replace(regex, String(v ?? ''));
          html = html.replace(regex, String(v ?? ''));
        }
      }

      try {
        const sendResult = await this.mailService.sendEmail(
          recipient,
          subject,
          template.bodyText || subject,
          html,
          template.notificationType
        );

        await this.logExecution({
          channel: NotificationChannel.EMAIL,
          notificationType: template.notificationType,
          recipient,
          subject,
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
        for (const [k, v] of Object.entries(payload)) {
          const regex = new RegExp(`{{${k}}}`, 'g');
          text = text.replace(regex, String(v ?? ''));
        }
      }

      try {
        const sendResult = await this.telegramService.sendMessage(text);

        await this.logExecution({
          channel: NotificationChannel.TELEGRAM,
          notificationType: template.notificationType,
          recipient: 'Telegram Bot Channel',
          subject: 'Telegram Bot Alert',
          request: { trigger_id: trigger.id, event_key: trigger.eventKey, payload },
          response: sendResult,
          status: NotificationStatus.SENT,
        });
      } catch (sendErr: any) {
        await this.logExecution({
          channel: NotificationChannel.TELEGRAM,
          notificationType: template.notificationType,
          recipient: 'Telegram Bot Channel',
          subject: 'Telegram Bot Alert',
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
    request: any;
    response: any;
    status: number;
  }) {
    try {
      await this.prisma.notification_logs.create({
        data: {
          channel: params.channel,
          notificationType: params.notificationType,
          recipient: params.recipient,
          subject: params.subject || null,
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
