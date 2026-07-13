import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить список студентов' })
  @ApiResponse({ status: 200, description: 'Список получен' })
  async listStudents() {
    return this.studentsService.listStudents();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Получить профиль студента по ID' })
  async getStudent(@Param('id') id: string) {
    return this.studentsService.getStudent(id);
  }

  @Post()
  @Roles('admin')
  @Audit('students', 'create')
  @ApiOperation({ summary: 'Создать нового студента' })
  async createStudent(@Body() dto: any) {
    return this.studentsService.createStudent(dto);
  }

  @Put(':id')
  @Roles('admin')
  @Audit('students', 'update')
  @ApiOperation({ summary: 'Обновить профиль студента' })
  async updateStudent(@Param('id') id: string, @Body() dto: any) {
    return this.studentsService.updateStudent(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('students', 'delete')
  @ApiOperation({ summary: 'Удалить студента' })
  async deleteStudent(@Param('id') id: string) {
    return this.studentsService.deleteStudent(id);
  }
}
