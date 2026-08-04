import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BookingsAdminController } from './bookings-admin.controller';
import { CheckoutService } from './checkout.service';
import { BookingsAdminService } from './bookings-admin.service';
import { CheckoutCoreService } from './checkout-core.service';

import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    CheckoutController,
    StripeWebhookController,
    BookingsAdminController,
  ],
  providers: [CheckoutCoreService, CheckoutService, BookingsAdminService],
  exports: [CheckoutCoreService, CheckoutService, BookingsAdminService],
})
export class CheckoutModule {}
