import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './domain/payments.repository.interface';
import { PrismaPaymentsRepository } from './impl/prisma-payments.repository';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PaymentsController],
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
