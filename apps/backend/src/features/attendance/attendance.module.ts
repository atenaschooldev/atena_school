import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './domain/attendance.repository.interface';
import { PrismaAttendanceRepository } from './impl/prisma-attendance.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: AttendanceRepository,
      useClass: PrismaAttendanceRepository,
    },
  ],
  exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
