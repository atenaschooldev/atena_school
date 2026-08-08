import { Module } from '@nestjs/common';
import { StudentsController } from './students.admin.controller';
import { StudentsService } from './students.admin.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
