import { Controller, Get, Patch, Param, Query, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { MembershipsService } from './memberships.service';

export class UpdateMembershipStatusDto {
  @IsString()
  @IsIn(['active', 'revoked', 'expired'])
  status: string;
}

@ApiTags('Admin — Memberships')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список годовых членских взносов' })
  findAll(
    @Query('status') status?: string,
    @Query('academicYear') academicYear?: string,
    @Query('search') search?: string,
  ) {
    return this.membershipsService.findAll(status, academicYear, search);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить взнос по ID' })
  findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin')
  @Audit('memberships', 'update_status')
  @ApiOperation({ summary: 'Обновить статус взноса (активный / отозванный)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMembershipStatusDto) {
    return this.membershipsService.updateStatus(id, dto.status);
  }
}
