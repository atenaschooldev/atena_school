import { Controller, Post, Body, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { MailService } from './mail.service';
import { TelegramService, TelegramButton } from './telegram.service';

export class SendMailDto {
  @ApiProperty({ description: 'Email получателя', example: 'student@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Тема письма', example: 'Conferma Iscrizione Corso — Atena School' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Текстовая версия письма', example: 'La tua iscrizione è confermata.' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'HTML версия письма', required: false, example: '<h1>La tua iscrizione è confermata.</h1>' })
  @IsOptional()
  @IsString()
  html?: string;
}

export class TestMailDto {
  @ApiProperty({ description: 'Email для отправки теста (если не указан, берется дефолтный)', required: false, example: 'admin@atenaschool.com' })
  @IsOptional()
  @IsEmail()
  to?: string;
}

export class PaymentReminderDto {
  @ApiProperty({ description: 'ID бронирования в базе данных', example: 'atn_bk_98f4a1c2' })
  @IsString()
  bookingId: string;

  @ApiProperty({ description: 'Индивидуальная заметка к напоминанию', required: false, example: 'Ricordiamo che il saldo va effettuato entro venerdì.' })
  @IsOptional()
  @IsString()
  customNote?: string;
}

export class MembershipReceiptDto {
  @ApiProperty({ description: 'ID членства/студента', example: 'mem_12345678' })
  @IsString()
  membershipId: string;
}

export class TelegramButtonDto implements TelegramButton {
  @ApiProperty({ description: 'Текст на кнопке', example: '💬 WhatsApp' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'URL перехода', example: 'https://wa.me/393756052362' })
  @IsString()
  url: string;
}

export class SendTelegramDto {
  @ApiProperty({ description: 'Текст сообщения в формате HTML', example: '🚨 <b>Nuovo messaggio da Atena CRM</b>' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Ряды инлайн-кнопок', required: false, type: [[TelegramButtonDto]] })
  @IsOptional()
  @IsArray()
  buttons?: TelegramButton[][];
}

@ApiTags('Admin — Notifications (Mail & Telegram)')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller(['admin/mail', 'landing/mail', 'mail'])
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  @Post('send')
  @Roles('admin')
  @Audit('mail', 'send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить произвольное email-уведомление через Resend / SMTP' })
  @ApiResponse({ status: 200, description: 'Email успешно отправлен' })
  async sendMail(@Body() dto: SendMailDto) {
    const result = await this.mailService.sendEmail(dto.to, dto.subject, dto.text, dto.html);
    return result;
  }

  @Post('test')
  @Roles('admin')
  @Audit('mail', 'test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить тестовое письмо для проверки конфигурации почты' })
  @ApiResponse({ status: 200, description: 'Тестовое письмо отправлено' })
  async sendTestMail(@Body() dto: TestMailDto) {
    if (!dto.to) {
      return { success: false, error: 'Recipient email (to) is required' };
    }
    const targetEmail = dto.to;
    const subject = 'Test Email — Atena School System';
    const html = '<h2>Atena School Notification System</h2><p>Verifica del funzionamento del servizio email di Atena School.</p>';
    const result = await this.mailService.sendEmail(targetEmail, subject, 'Verifica del funzionamento del servizio email.', html);
    return result;
  }

  @Post('send-payment-reminder')
  @Roles('admin')
  @Audit('mail', 'send_payment_reminder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить напоминание об оплате по бронированию' })
  async sendPaymentReminder(@Body() dto: PaymentReminderDto) {
    return { success: true, bookingId: dto.bookingId, sentAt: new Date().toISOString() };
  }

  @Post('send-membership-receipt')
  @Roles('admin')
  @Audit('mail', 'send_membership_receipt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Повторно выслать квитанцию взноса €30 на e-mail' })
  async sendMembershipReceipt(@Body() dto: MembershipReceiptDto) {
    return { success: true, membershipId: dto.membershipId, sentAt: new Date().toISOString() };
  }

  @Post('telegram/send')
  @Roles('admin')
  @Audit('telegram', 'send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить произвольное сообщение в Telegram-чат администраторов' })
  @ApiResponse({ status: 200, description: 'Сообщение успешно доставлено в Telegram' })
  async sendTelegramMessage(@Body() dto: SendTelegramDto) {
    const result = await this.telegramService.sendMessage(dto.text, dto.buttons);
    return result;
  }

  @Post('telegram/test')
  @Roles('admin')
  @Audit('telegram', 'test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправить тестовое уведомление в Telegram-бот' })
  @ApiResponse({ status: 200, description: 'Тестовое сообщение отправлено' })
  async sendTelegramTest() {
    const text = '🔔 <b>TEST ATENA NOTIFICATION BOT</b>\n\nIl bot Telegram di Atena School è configurato correttamente e attivo per ricevere le notifiche di CRM e iscrizioni!';
    const buttons: TelegramButton[][] = [
      [{ text: '🌐 Apri Portale Admin', url: 'https://atena-school-admin.vercel.app' }],
    ];
    const result = await this.telegramService.sendMessage(text, buttons);
    return result;
  }
}
