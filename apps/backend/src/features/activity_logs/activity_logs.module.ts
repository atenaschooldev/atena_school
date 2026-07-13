import { Module, Global } from '@nestjs/common';
import { ActivityLogsService } from './activity_logs.service';
import { ActivityLogsController } from './activity_logs.controller';
import { ActivityLogsRepository } from './domain/activity-logs.repository.interface';
import { PrismaActivityLogsRepository } from './impl/prisma-activity-logs.repository';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [ActivityLogsController],
  providers: [
    ActivityLogsService,
    {
      provide: ActivityLogsRepository,
      useClass: PrismaActivityLogsRepository,
    },
  ],
  exports: [ActivityLogsService, ActivityLogsRepository],
})
export class ActivityLogsModule {}
