import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import {
  UpdateIntegrationDto,
  TestIntegrationDto,
  SetTelegramWebhookDto,
} from './dto/integration.dto';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

@ApiTags('Admin — Integrations & White-Label')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить состояние и маскированные конфигурации всех внешних интеграций' })
  async getAllIntegrations() {
    return this.integrationsService.getAllIntegrations();
  }

  @Patch(':provider')
  @Roles('admin')
  @Audit('integrations', 'update_provider')
  @ApiOperation({ summary: 'Обновить ключи и настройки конкретного провайдера (Resend, Telegram, Stripe)' })
  async updateIntegration(
    @Param('provider') provider: string,
    @Body() dto: UpdateIntegrationDto,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    return this.integrationsService.updateIntegration(provider, dto, userId);
  }

  @Post(':provider/reveal')
  @Roles('admin')
  @Audit('integrations', 'reveal_provider_secret')
  @ApiOperation({ summary: 'Расшифровать и показать реальный ключ интеграции для администратора (Eye)' })
  async revealIntegration(
    @Param('provider') provider: string
  ) {
    return this.integrationsService.revealIntegration(provider);
  }

  @Post('telegram/set-webhook')
  @Roles('admin')
  @Audit('integrations', 'set_telegram_webhook')
  @ApiOperation({ summary: 'Зарегистрировать webhook Telegram бота на API бэкенда' })
  async setTelegramWebhook(@Body() dto: SetTelegramWebhookDto) {
    return this.integrationsService.setTelegramWebhook(dto);
  }

  @Post('test/:provider')
  @Roles('admin')
  @Audit('integrations', 'test_provider')
  @ApiOperation({ summary: 'Проверить работоспособность интеграции (тестовое письмо/сообщение/баланс)' })
  async testIntegration(
    @Param('provider') provider: string,
    @Body() dto: TestIntegrationDto
  ) {
    return this.integrationsService.testIntegration(provider, dto);
  }
}
