import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationChannel, NotificationStatus, NotificationType } from '@atena/api-types';
import { getResendCredentials } from '@atena/core';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private resendApiKey: string | null = null;
  private defaultFromEmail: string = 'Atena School <onboarding@resend.dev>';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || null;
    const configuredFrom = this.configService.get<string>('RESEND_FROM_EMAIL') || this.configService.get<string>('SMTP_FROM');
    if (configuredFrom) {
      this.defaultFromEmail = configuredFrom;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (this.resendApiKey) {
      this.logger.log('[MAIL]: Resend API провайдер успешно инициализирован.');
    } else if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('[MAIL]: SMTP транспорт успешно инициализирован.');
    } else {
      this.logger.warn('[MAIL WARNING]: Настройки Resend API / SMTP не заданы. Письма будут логироваться в консоль.');
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    notificationType: number = NotificationType.BOOKING_CONFIRMATION,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const creds = await getResendCredentials();
    const apiKey = creds.apiKey || this.resendApiKey;
    const from = creds.fromEmail || this.defaultFromEmail;
    let result: { success: boolean; id?: string; error?: string } = { success: false };

    // 1. Resend API Dispatch (Primary if key configured)
    if (apiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject,
            text,
            html: html || text,
          }),
        });

        const resData = (await response.json()) as { id?: string; message?: string };

        if (!response.ok) {
          this.logger.error(`[MAIL RESEND ERROR]: ${resData.message || response.statusText}`);
          result = { success: false, error: resData.message || response.statusText };
        } else {
          this.logger.log(`[MAIL RESEND SUCCESS]: Письмо отправлено на ${to} (ID: ${resData.id})`);
          result = { success: true, id: resData.id };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`[MAIL RESEND NETWORK ERROR]: ${msg}`);
        result = { success: false, error: msg };
      }
    } else if (this.transporter) {
      // 2. SMTP Transporter
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });
        this.logger.log(`[MAIL SMTP SUCCESS]: Письмо отправлено на ${to}: ${subject}`);
        result = { success: true, id: info.messageId };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`[MAIL SMTP ERROR]: ${msg}`);
        result = { success: false, error: msg };
      }
    } else {
      // 3. Fallback Mock Log
      this.logger.log(`[MAIL MOCK]: Отправка письма на ${to}`);
      result = { success: true, id: 'mock-id' };
    }

    // Async log to notification_logs
    this.prisma.notification_logs.create({
      data: {
        channel: NotificationChannel.EMAIL,
        notificationType,
        recipient: to,
        subject,
        request: { from, to, subject, text, hasHtml: Boolean(html) },
        response: result,
        status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
      },
    }).catch(() => null);

    return result;
  }
}

