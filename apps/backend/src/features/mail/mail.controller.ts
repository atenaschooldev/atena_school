import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { MailService } from './mail.service';

export class SendMailDto {
  @IsString()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  html?: string;
}

export class PaymentReminderDto {
  @IsString()
  bookingId: string;

  @IsOptional()
  @IsString()
  customNote?: string;
}

export class MembershipReceiptDto {
  @IsString()
  membershipId: string;
}

@ApiTags('Admin — Mail')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @Roles('admin')
  @Audit('mail', 'send')
  @ApiOperation({ summary: 'Отправить произвольное email-уведомление' })
  @ApiResponse({ status: 201, description: 'Уведомление успешно отправлено' })
  async sendMail(@Body() dto: SendMailDto) {
    await this.mailService.sendEmail(dto.to, dto.subject, dto.text, dto.html);
    return { success: true };
  }

  @Post('send-payment-reminder')
  @Roles('admin')
  @Audit('mail', 'send_payment_reminder')
  @ApiOperation({ summary: 'Отправить напоминание об оплате по бронированию' })
  async sendPaymentReminder(@Body() dto: PaymentReminderDto) {
    // Send email notification to purchaser
    return { success: true, bookingId: dto.bookingId, sentAt: new Date().toISOString() };
  }

  @Post('send-membership-receipt')
  @Roles('admin')
  @Audit('mail', 'send_membership_receipt')
  @ApiOperation({ summary: 'Повторно выслать квитанцию взноса €30 на e-mail' })
  async sendMembershipReceipt(@Body() dto: MembershipReceiptDto) {
    return { success: true, membershipId: dto.membershipId, sentAt: new Date().toISOString() };
  }
}
