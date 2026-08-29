import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log('[MAIL]: SMTP транспорт успешно инициализирован.');
    } else {
      console.warn('[MAIL WARNING]: Настройки SMTP не заданы. Письма будут логироваться в консоль.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || 'Atena School <noreply@atenaschool.com>';

    if (this.transporter) {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[MAIL SUCCESS]: Письмо отправлено на ${to}: ${subject}`);
    } else {
      console.log(`[MAIL MOCK]: Отправка письма на ${to}`);
      console.log(`Тема: ${subject}`);
      console.log(`Текст: ${text}`);
      if (html) console.log(`HTML: ${html}`);
    }
  }
}
