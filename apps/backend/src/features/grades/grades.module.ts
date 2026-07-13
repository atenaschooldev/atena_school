import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { GradesRepository } from './domain/grades.repository.interface';
import { PrismaGradesRepository } from './impl/prisma-grades.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GradesController],
  providers: [
    GradesService,
    {
      provide: GradesRepository,
      useClass: PrismaGradesRepository,
    },
  ],
  exports: [GradesService, GradesRepository],
})
export class GradesModule {}
