import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { AttendanceService } from './attendance.service';

@ApiTags('attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('lessons/:lessonId/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить журнал посещаемости урока' })
  async getLessonAttendance(@Param('lessonId') lessonId: string) {
    return this.attendanceService.getLessonAttendance(lessonId);
  }

  @Post()
  @Roles('admin', 'teacher')
  @Audit('attendance', 'mark')
  @ApiOperation({ summary: 'Отметить посещаемость студентов на уроке (массовая операция)' })
  async markAttendance(
    @Param('lessonId') lessonId: string,
    @Body() records: any[],
    @Req() req: any,
  ) {
    return this.attendanceService.markAttendance(lessonId, records, req.user.id);
  }
}
