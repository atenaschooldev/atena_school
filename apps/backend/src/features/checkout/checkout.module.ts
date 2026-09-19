import { Module } from '@nestjs/common';
import { CheckoutController } from './public/checkout.public.controller';
import { CoursesPublicController } from './public/courses.public.controller';
import { ContactPublicController } from './public/contact.public.controller';
import { BookingsPublicController } from './public/bookings.public.controller';
import { SettingsPublicController } from './public/settings.public.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BookingsAdminController } from './admin/bookings.admin.controller';
import { PromoCodesAdminController } from './admin/promo-codes.admin.controller';
import { CheckoutService } from './public/checkout.public.service';
import { BookingsAdminService } from './admin/bookings.admin.service';
import { PromoCodesAdminService } from './admin/promo-codes.admin.service';
import { CheckoutCoreService } from './checkout-core.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [
    CheckoutController,
    CoursesPublicController,
    ContactPublicController,
    BookingsPublicController,
    SettingsPublicController,
    StripeWebhookController,
    BookingsAdminController,
    PromoCodesAdminController,
  ],
  providers: [CheckoutCoreService, CheckoutService, BookingsAdminService, PromoCodesAdminService],
  exports: [CheckoutCoreService, CheckoutService, BookingsAdminService, PromoCodesAdminService],
})
export class CheckoutModule {}
