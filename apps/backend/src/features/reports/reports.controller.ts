import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { ReportsService } from './reports.service';

@ApiTags('Admin — Reports / Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @Roles('admin')
  @ApiOperation({ summary: 'Финансовый отчёт по выручке (периоды, форматы оплаты)' })
  async getRevenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getRevenueReport(startDate, endDate);
  }

  @Get('debtors')
  @Roles('admin')
  @ApiOperation({ summary: 'Реестр задолженностей и неоплаченных бронирований' })
  async getDebtorsReport() {
    return this.reportsService.getDebtorsReport();
  }

  @Get('attendance-summary')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Сводный отчёт по посещаемости и загрузке' })
  async getAttendanceSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAttendanceSummary(startDate, endDate);
  }
}
