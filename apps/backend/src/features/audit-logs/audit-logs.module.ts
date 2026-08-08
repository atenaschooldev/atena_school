import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.admin.controller';
import { AuditLogsService } from './audit-logs.admin.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
