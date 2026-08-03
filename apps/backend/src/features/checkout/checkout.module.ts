import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BookingsAdminController } from './bookings-admin.controller';
import { CheckoutService } from './checkout.service';
import { BookingsAdminService } from './bookings-admin.service';

import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    CheckoutController,
    StripeWebhookController,
    BookingsAdminController,
  ],
  providers: [CheckoutService, BookingsAdminService],
  exports: [CheckoutService, BookingsAdminService],
})
export class CheckoutModule {}
