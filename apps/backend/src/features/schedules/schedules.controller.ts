import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { SchedulesService } from './schedules.service';

@ApiTags('schedules')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список расписаний' })
  async listSchedules() {
    return this.schedulesService.listSchedules();
  }

  @Post()
  @Roles('admin')
  @Audit('schedules', 'create')
  @ApiOperation({ summary: 'Создать новый элемент расписания' })
  async createSchedule(@Body() dto: any) {
    return this.schedulesService.createSchedule(dto);
  }

  @Post(':id/generate-lessons')
  @Roles('admin')
  @Audit('lessons', 'generate')
  @ApiOperation({ summary: 'Сгенерировать уроки на основе расписания' })
  async generateLessons(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.schedulesService.generateLessons(id, startDate, endDate);
  }
}
