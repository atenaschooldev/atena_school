import { Module } from '@nestjs/common';
import { ReportsController } from './reports.admin.controller';
import { ReportsService } from './reports.admin.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
