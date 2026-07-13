import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesRepository } from './domain/courses.repository.interface';
import { PrismaCoursesRepository } from './impl/prisma-courses.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    {
      provide: CoursesRepository,
      useClass: PrismaCoursesRepository,
    },
  ],
  exports: [CoursesService, CoursesRepository],
})
export class CoursesModule {}
