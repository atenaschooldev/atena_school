import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TeachersRepository } from './domain/teachers.repository.interface';
import { PrismaTeachersRepository } from './impl/prisma-teachers.repository';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeachersController],
  providers: [
    TeachersService,
    { provide: TeachersRepository, useClass: PrismaTeachersRepository },
  ],
  exports: [TeachersService],
})
export class TeachersModule {}
