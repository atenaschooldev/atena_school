import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { MembershipsService } from './memberships.service';

@ApiTags('Admin — Memberships')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin/memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List annual memberships' })
  findAll(
    @Query('status') status?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.membershipsService.findAll(status, academicYear);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get membership by ID' })
  findOne(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Update membership status (active / revoked)' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.membershipsService.updateStatus(id, status);
  }
}
