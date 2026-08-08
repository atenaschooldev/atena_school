import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.admin.service';
import { SchedulesController } from './schedules.admin.controller';
import { SchedulesRepository } from './domain/schedules.repository.interface';
import { PrismaSchedulesRepository } from './impl/prisma-schedules.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    {
      provide: SchedulesRepository,
      useClass: PrismaSchedulesRepository,
    },
  ],
  exports: [SchedulesService, SchedulesRepository],
})
export class SchedulesModule {}
