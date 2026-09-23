import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { ActiveServicesAdminService } from './active-services.admin.service';
import { QueryActiveServicesDto } from './dto/active-services.admin.dto';

@ApiTags('Admin — Active Services')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/active-services')
export class ActiveServicesAdminController {
  constructor(private readonly activeServicesService: ActiveServicesAdminService) {}

  @Get()
  @Roles('admin', 'director', 'superadmin')
  @ApiOperation({ summary: 'List all active student course enrollments, subscriptions and progress from active_services view' })
  async getActiveServices(@Query() query: QueryActiveServicesDto) {
    return this.activeServicesService.getActiveServices(query);
  }
}
