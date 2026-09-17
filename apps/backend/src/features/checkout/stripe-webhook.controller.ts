import { Controller, Post, Req, Res, Headers, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { CheckoutService } from './public/checkout.public.service';

@ApiTags('Landing — Webhooks (Stripe)')
@Controller('landing/webhooks')
export class StripeWebhookController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('stripe')
  @ApiOperation({
    summary: 'Обработчик входящих событий Stripe',
    description: 'Принимает и валидирует webhook события Stripe (checkout.session.completed, invoice.payment_succeeded, customer.subscription.updated, customer.subscription.deleted)',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Цифровая подпись заголовка Stripe (HMAC-SHA256)',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Вебхук успешно обработан',
    schema: { example: { received: true } },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректная подпись или ошибка верификации',
    schema: { example: { error: 'Webhook signature verification failed' } },
  })
  async handleStripeWebhook(
    @Req() req: any,
    @Res() res: any,
    @Headers('stripe-signature') signature: string
  ) {
    try {
      const body = req.rawBody || req.body;
      const result = await this.checkoutService.handleStripeWebhook(body, signature);
      return res.status(HttpStatus.OK).send(result);
    } catch (err: any) {
      console.error('[Stripe Webhook Error]:', err.message);
      return res.status(HttpStatus.BAD_REQUEST).send({ error: err.message });
    }
  }
}
