import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationTemplateDto, TestSendNotificationDto } from './dto/notification-template.dto';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

@ApiTags('Admin — Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('templates')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить список шаблонов уведомлений (Email & Telegram)' })
  async getTemplates(
    @Query('channel') channel?: number,
    @Query('recipient_type') recipient_type?: number,
    @Query('search') search?: string,
  ) {
    return this.notificationsService.getTemplates({ channel, recipient_type, search });
  }

  @Get('templates/:id')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить шаблон по ID' })
  async getTemplateById(@Param('id') id: string) {
    return this.notificationsService.getTemplateById(id);
  }

  @Patch('templates/:id')
  @Roles('admin')
  @Audit('notifications', 'update_template')
  @ApiOperation({ summary: 'Обновить шаблон уведомления (тема, тело, статус)' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.notificationsService.updateTemplate(id, dto);
  }

  @Post('templates/:id/test-send')
  @Roles('admin')
  @Audit('notifications', 'test_send')
  @ApiOperation({ summary: 'Отправить тестовое уведомление (Email или Telegram)' })
  async testSend(
    @Param('id') id: string,
    @Body() dto: TestSendNotificationDto,
  ) {
    return this.notificationsService.testSend(id, dto);
  }
}
