import { Module } from '@nestjs/common';
import { CheckoutController } from './public/checkout.public.controller';
import { CoursesPublicController } from './public/courses.public.controller';
import { ContactPublicController } from './public/contact.public.controller';
import { BookingsPublicController } from './public/bookings.public.controller';
import { SettingsPublicController } from './public/settings.public.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { BookingsAdminController } from './admin/bookings.admin.controller';
import { PromoCodesAdminController } from './admin/promo-codes.admin.controller';
import { SettingsAdminController } from './admin/settings.admin.controller';
import { MarketingPopupsAdminController } from './admin/marketing-popups.admin.controller';
import { MarketingPopupsPublicController } from './public/marketing-popups.public.controller';
import { CheckoutService } from './public/checkout.public.service';
import { BookingsAdminService } from './admin/bookings.admin.service';
import { PromoCodesAdminService } from './admin/promo-codes.admin.service';
import { MarketingPopupsAdminService } from './admin/marketing-popups.admin.service';
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
    SettingsAdminController,
    MarketingPopupsAdminController,
    MarketingPopupsPublicController,
  ],
  providers: [
    CheckoutCoreService,
    CheckoutService,
    BookingsAdminService,
    PromoCodesAdminService,
    MarketingPopupsAdminService,
  ],
  exports: [
    CheckoutCoreService,
    CheckoutService,
    BookingsAdminService,
    PromoCodesAdminService,
    MarketingPopupsAdminService,
  ],
})
export class CheckoutModule {}

