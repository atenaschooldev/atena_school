import { Body, Controller, Get, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Settings & Gateways')
@Controller(['admin/settings', 'landing/settings', 'checkout/settings', 'settings'])
export class SettingsPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(['payment-gateway', ''])
  @ApiOperation({
    summary: 'Получить настройки платежного шлюза',
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

  @Patch(['payment-gateway', ''])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновить настройки платежного шлюза и подписок',
    description: 'Позволяет включить или выключить Stripe шлюз и регулярные подписки на чекауте',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripeEnabled: { type: 'boolean', example: true, description: 'Флаг активности Stripe онлайн-оплаты' },
        subscriptionsEnabled: { type: 'boolean', example: true, description: 'Флаг активности ежемесячных подписок' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно обновлены',
    schema: { example: { success: true, settings: { stripeEnabled: true, subscriptionsEnabled: true } } },
  })
  async updatePaymentGateway(@Body() body: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }) {
    const settings = await this.checkoutService.updateSettings(body);
    return { success: true, settings };
  }

  @Get('school-profile')
  @ApiOperation({
    summary: 'Получить профиль и брендинг школы',
    description: 'Возвращает текущие настройки школы, контакты, соцсети и размер взноса',
  })
  async getSchoolProfile() {
    const profile = await this.checkoutService.getSchoolProfile();
    return { success: true, profile };
  }

  @Patch('school-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновить профиль и брендинг школы',
    description: 'Обновляет профиль школы (White-Label настройки) в app_settings',
  })
  async updateSchoolProfile(@Body() body: any) {
    const profile = await this.checkoutService.updateSchoolProfile(body);
    return { success: true, profile };
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Получить активные трекинговые ID веб-аналитики',
    description: 'Возвращает публичные ID GA4, GTM, Clarity и Meta Pixel для подключения на лендинге',
  })
  async getAnalyticsSettings() {
    const analytics = await this.checkoutService.getAnalyticsSettings();
    return { success: true, analytics };
  }

  @Get('domains')
  @ApiOperation({
    summary: 'Получить официальные домены и URL школы',
    description: 'Возвращает siteUrl, appUrl, adminUrl для ссылок и переходов между приложениями',
  })
  async getDomainsSettings() {
    const domains = await this.checkoutService.getDomainsSettings();
    return { success: true, domains };
  }
}
