import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { AttendanceService } from './attendance.service';

class MarkAttendanceDto {
  @IsString()
  lessonId: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsString()
  status: string; // present, absent, excused, late

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  markedBy?: string;
}

class PayLessonDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

class CreateManualLessonDto {
  @IsString()
  bookingId: string;

  @IsString()
  startsAt: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  pricePerLesson?: number;
}

@ApiTags('Admin — Presenze / Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить журнал посещаемости на выбранную дату' })
  async getDailyAttendance(
    @Query('date') date?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.attendanceService.getDailyAttendance(date, courseId);
  }

  @Post('mark')
  @Roles('admin', 'teacher')
  @Audit('attendance', 'mark')
  @ApiOperation({ summary: 'Отметить статус присутствия студента на уроке' })
  async markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Post(':lessonId/pay-lesson')
  @Roles('admin')
  @Audit('attendance', 'pay')
  @ApiOperation({ summary: 'Быстрая оплата урока после посещения (поурочная оплата)' })
  async payLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: PayLessonDto,
  ) {
    return this.attendanceService.payLesson({
      lessonId,
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
    });
  }

  @Get('active-bookings')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить список активных бронирований для выбора студента' })
  async getActiveBookings() {
    return this.attendanceService.getActiveBookings();
  }

  @Get('stats/:bookingId')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить статистику посещаемости студента по курсу' })
  async getBookingStats(@Param('bookingId') bookingId: string) {
    return this.attendanceService.getBookingStats(bookingId);
  }

  @Post('manual')
  @Roles('admin', 'teacher')
  @Audit('attendance', 'manual')
  @ApiOperation({ summary: 'Вручную внести внеплановый урок/присутствие' })
  async createManualRecord(@Body() dto: CreateManualLessonDto) {
    return this.attendanceService.createManualLessonRecord(dto);
  }

  @Delete(':lessonId')
  @Roles('admin')
  @Audit('attendance', 'delete')
  @ApiOperation({ summary: 'Удалить / сбросить запись посещаемости' })
  async deleteAttendance(@Param('lessonId') lessonId: string) {
    return this.attendanceService.deleteAttendance(lessonId);
  }
}
