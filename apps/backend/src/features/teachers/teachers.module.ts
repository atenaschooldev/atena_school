import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeachersRepository } from './domain/teachers.repository.interface';
import { PrismaTeachersRepository } from './impl/prisma-teachers.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TeachersController],
  providers: [
    TeachersService,
    {
      provide: TeachersRepository,
      useClass: PrismaTeachersRepository,
    },
  ],
  exports: [TeachersService, TeachersRepository],
})
export class TeachersModule {}
