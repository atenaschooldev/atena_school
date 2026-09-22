import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Landing — Settings & Gateways (Public)')
@Controller('landing/settings')
export class SettingsPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(['payment-gateway', ''])
  @ApiOperation({
    summary: 'Получить статус платежного шлюза (Public)',
    description: 'Возвращает состояние платежного шлюза Stripe (включен/отключен) для отображения на форме чекаута лендинга',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки шлюза успешно получены',
    schema: {
      example: {
        success: true,
        settings: {
          stripeEnabled: true,
        },
      },
    },
  })
  async getPaymentGateway() {
    const settings = await this.checkoutService.getSettings();
    return { success: true, settings };
  }

  @Get('school-profile')
  @ApiOperation({
    summary: 'Получить публичный профиль и контакты школы (Public)',
    description: 'Возвращает публичные контакты школы, соцсети и размер годового взноса для отображения на лендинге',
  })
  async getSchoolProfile() {
    const profile = await this.checkoutService.getSchoolProfile();
    return { success: true, profile };
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Получить активные трекинговые ID веб-аналитики (Public)',
    description: 'Возвращает публичные ID GA4, GTM, Clarity и Meta Pixel для подключения аналитики на лендинге',
  })
  async getAnalyticsSettings() {
    const analytics = await this.checkoutService.getAnalyticsSettings();
    return { success: true, analytics };
  }

  @Get('domains')
  @ApiOperation({
    summary: 'Получить официальные домены и URL школы (Public)',
    description: 'Возвращает siteUrl, appUrl, adminUrl для ссылок и переходов между приложениями',
  })
  async getDomainsSettings() {
    const domains = await this.checkoutService.getDomainsSettings();
    return { success: true, domains };
  }
}
