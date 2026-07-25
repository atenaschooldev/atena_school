import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MeController } from './me.controller';
import { StudentsRepository } from './domain/students.repository.interface';
import { PrismaStudentsRepository } from './impl/prisma-students.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StudentsController, MeController],
  providers: [
    StudentsService,
    {
      provide: StudentsRepository,
      useClass: PrismaStudentsRepository,
    },
  ],
  exports: [StudentsService, StudentsRepository],
})
export class StudentsModule {}
