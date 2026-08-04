import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { SchedulesService } from './schedules.service';

export class CreateScheduleDto {
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  course_id?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  teacher_id?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  dayOfWeek?: number;

  @IsOptional()
  @IsNumber()
  day_of_week?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  lessonType?: string;

  @IsOptional()
  @IsString()
  meetingUrl?: string;
}

export class UpdateScheduleDto extends CreateScheduleDto {}

export class BulkHolidayCancelDto {
  @IsString()
  holidayDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class SubstituteTeacherDto {
  @IsOptional()
  @IsString()
  scheduleId?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  originalTeacherId?: string;

  @IsString()
  substituteTeacherId: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

@ApiTags('Admin — Schedules')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список расписаний (с фильтрацией)' })
  async listSchedules(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.schedulesService.listSchedules({ courseId, teacherId });
  }

  @Post()
  @Roles('admin')
  @Audit('schedules', 'create')
  @ApiOperation({ summary: 'Создать новый элемент расписания' })
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.createSchedule(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('schedules', 'update')
  @ApiOperation({ summary: 'Обновить элемент расписания' })
  async updateSchedule(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.updateSchedule(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('schedules', 'delete')
  @ApiOperation({ summary: 'Удалить элемент расписания' })
  async deleteSchedule(@Param('id') id: string) {
    return this.schedulesService.deleteSchedule(id);
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

  @Post('bulk-holiday-cancel')
  @Roles('admin')
  @Audit('schedules', 'bulk_holiday_cancel')
  @ApiOperation({ summary: 'Массовая отмена уроков на официальный праздник' })
  async cancelHolidayLessons(@Body() dto: BulkHolidayCancelDto) {
    return this.schedulesService.cancelHolidayLessons(dto.holidayDate, dto.reason);
  }

  @Post('substitute-teacher')
  @Roles('admin')
  @Audit('schedules', 'substitute_teacher')
  @ApiOperation({ summary: 'Назначить заменяющего преподавателя на период' })
  async substituteTeacher(@Body() dto: SubstituteTeacherDto) {
    return this.schedulesService.substituteTeacher(dto);
  }
}
