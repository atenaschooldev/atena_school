import { Controller, Post, Req, Res, Headers, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';

@ApiTags('Public Landing Checkout')
@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('stripe')
  @ApiOperation({ summary: 'Обработчик вебхуков Stripe (checkout.session.completed)' })
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
