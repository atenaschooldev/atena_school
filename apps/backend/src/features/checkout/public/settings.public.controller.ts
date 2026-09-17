import { Body, Controller, Get, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Landing — Settings & Gateways')
@Controller('settings')
export class SettingsPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('payment-gateway')
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

  @Patch('payment-gateway')
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
}
