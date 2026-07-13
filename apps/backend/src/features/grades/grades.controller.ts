import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { GradesService } from './grades.service';

@ApiTags('grades')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('student/:studentId')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить все оценки студента' })
  async getStudentGrades(@Param('studentId') studentId: string) {
    return this.gradesService.getStudentGrades(studentId);
  }

  @Post()
  @Roles('admin', 'teacher')
  @Audit('grades', 'create')
  @ApiOperation({ summary: 'Выставить оценку за занятие' })
  async createGrade(@Body() dto: any, @Req() req: any) {
    return this.gradesService.createGrade(dto, req.user.id);
  }

  @Get('student/:studentId/skills')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить оценки студента по языковым навыкам' })
  async getStudentSkillGrades(@Param('studentId') studentId: string) {
    return this.gradesService.getStudentSkillGrades(studentId);
  }

  @Post('skills')
  @Roles('admin', 'teacher')
  @Audit('skill_grades', 'create')
  @ApiOperation({ summary: 'Выставить оценки успеваемости по навыкам (speaking, listening, reading, writing)' })
  async createSkillGrade(@Body() dto: any, @Req() req: any) {
    return this.gradesService.createSkillGrade(dto, req.user.id);
  }
}
