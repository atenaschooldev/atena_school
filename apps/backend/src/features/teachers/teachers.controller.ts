import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { TeachersService } from './teachers.service';

@ApiTags('teachers')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список преподавателей' })
  async listTeachers() {
    return this.teachersService.listTeachers();
  }

  @Get(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить профиль преподавателя' })
  async getTeacher(@Param('id') id: string) {
    return this.teachersService.getTeacher(id);
  }

  @Post()
  @Roles('admin')
  @Audit('teachers', 'create')
  @ApiOperation({ summary: 'Создать профиль преподавателя' })
  async createTeacher(@Body() dto: any) {
    return this.teachersService.createTeacher(dto);
  }

  @Put(':id')
  @Roles('admin')
  @Audit('teachers', 'update')
  @ApiOperation({ summary: 'Обновить профиль преподавателя' })
  async updateTeacher(@Param('id') id: string, @Body() dto: any) {
    return this.teachersService.updateTeacher(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('teachers', 'delete')
  @ApiOperation({ summary: 'Удалить преподавателя' })
  async deleteTeacher(@Param('id') id: string) {
    return this.teachersService.deleteTeacher(id);
  }
}
