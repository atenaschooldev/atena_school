import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { CheckoutService } from './checkout.service';

@Module({
  controllers: [CheckoutController, StripeWebhookController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
