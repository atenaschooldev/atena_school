import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { MailService } from './mail.service';

@ApiTags('mail')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @Roles('admin')
  @Audit('mail', 'send')
  @ApiOperation({ summary: 'Отправить email-уведомление' })
  @ApiResponse({ status: 201, description: 'Уведомление успешно отправлено' })
  async sendMail(@Body() dto: { to: string; subject: string; text: string; html?: string }) {
    await this.mailService.sendEmail(dto.to, dto.subject, dto.text, dto.html);
    return { success: true };
  }
}
