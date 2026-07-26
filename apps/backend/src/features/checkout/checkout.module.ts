import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BookingsAdminController } from './bookings-admin.controller';
import { CheckoutService } from './checkout.service';
import { ActivityLogsModule } from '../activity_logs/activity_logs.module';

@Module({
  imports: [ActivityLogsModule],
  controllers: [CheckoutController, StripeWebhookController, BookingsAdminController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
