import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CheckoutController } from './checkout.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PaymentsRepository } from './domain/payments.repository.interface';
import { PrismaPaymentsRepository } from './impl/prisma-payments.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController, CheckoutController, StripeWebhookController],
  providers: [
    PaymentsService,
    {
      provide: PaymentsRepository,
      useClass: PrismaPaymentsRepository,
    },
  ],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
