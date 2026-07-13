import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ActivityLogsService } from './activity_logs.service';

@ApiTags('activity_logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить журнал действий (аудит-логи)' })
  @ApiResponse({ status: 200, description: 'Журнал успешно получен' })
  async getLogs() {
    return this.activityLogsService.getLogs();
  }
}
