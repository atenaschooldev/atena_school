import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationTriggersService } from './notification-triggers.service';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  TestSendNotificationDto,
} from './dto/notification-template.dto';
import type { CreateNotificationTriggerDto, UpdateNotificationTriggerDto } from '@atena/api-types';
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
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly triggersService: NotificationTriggersService,
  ) {}

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

  @Post('templates')
  @Roles('admin')
  @Audit('notifications', 'create_template')
  @ApiOperation({ summary: 'Создать новый шаблон уведомлений' })
  async createTemplate(@Body() dto: CreateNotificationTemplateDto) {
    return this.notificationsService.createTemplate(dto);
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

  @Delete('templates/:id')
  @Roles('admin')
  @Audit('notifications', 'delete_template')
  @ApiOperation({ summary: 'Удалить шаблон уведомлений' })
  async deleteTemplate(@Param('id') id: string) {
    return this.notificationsService.deleteTemplate(id);
  }

  @Get('logs')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить журнал отправленных уведомлений (Email & Telegram)' })
  async getLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('channel') channel?: number,
    @Query('status') status?: number,
    @Query('search') search?: string,
  ) {
    return this.notificationsService.getLogs({ page, limit, channel, status, search });
  }

  @Post('logs/:id/retry')
  @Roles('admin', 'secretary')
  @Audit('notifications', 'retry_log')
  @ApiOperation({ summary: 'Повторить отправку неудачного уведомления (Retry)' })
  async retryLog(@Param('id') id: string) {
    return this.notificationsService.retryLog(id);
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

  // ── Trigger Endpoints ──────────────────────────────────────────────────────

  @Get('system-events')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить реестр системных событий и доступных переменных' })
  getSystemEvents() {
    return this.triggersService.getSystemEventsSchema();
  }

  @Get('triggers')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить список правил и триггеров автоматизации' })
  async getTriggers() {
    return this.triggersService.findAll();
  }

  @Get('triggers/:id')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить триггер по ID' })
  async getTriggerById(@Param('id') id: string) {
    return this.triggersService.findOne(id);
  }

  @Post('triggers')
  @Roles('admin')
  @Audit('notifications', 'create_trigger')
  @ApiOperation({ summary: 'Создать новое правило/триггер автоматизации' })
  async createTrigger(@Body() dto: CreateNotificationTriggerDto) {
    return this.triggersService.create(dto);
  }

  @Patch('triggers/:id')
  @Roles('admin')
  @Audit('notifications', 'update_trigger')
  @ApiOperation({ summary: 'Обновить параметры триггера' })
  async updateTrigger(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTriggerDto,
  ) {
    return this.triggersService.update(id, dto);
  }

  @Patch('triggers/:id/toggle')
  @Roles('admin')
  @Audit('notifications', 'toggle_trigger')
  @ApiOperation({ summary: 'Включить/выключить триггер' })
  async toggleTrigger(
    @Param('id') id: string,
    @Body('is_active') isActive: boolean,
  ) {
    return this.triggersService.toggleActive(id, isActive);
  }

  @Delete('triggers/:id')
  @Roles('admin')
  @Audit('notifications', 'delete_trigger')
  @ApiOperation({ summary: 'Удалить триггер' })
  async deleteTrigger(@Param('id') id: string) {
    return this.triggersService.delete(id);
  }
}

