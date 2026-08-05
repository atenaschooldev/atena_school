import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaMembershipsRepository } from './impl/prisma-memberships.repository';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CheckoutModule } from '../checkout/checkout.module';

@Module({
  imports: [PrismaModule, CheckoutModule],
  controllers: [MembershipsController],
  providers: [
    MembershipsService,
    { provide: MembershipsRepository, useClass: PrismaMembershipsRepository },
  ],
})
export class MembershipsModule {}
