import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список курсов' })
  async listCourses() {
    return this.coursesService.listCourses();
  }

  @Get('teachers')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список преподавателей' })
  async listTeachers() {
    return this.coursesService.listTeachers();
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить детальную информацию о курсе' })
  async getCourse(@Param('id') id: string) {
    return this.coursesService.getCourse(id);
  }

  @Post()
  @Roles('admin')
  @Audit('courses', 'create')
  @ApiOperation({ summary: 'Создать новый курс' })
  async createCourse(@Body() dto: any) {
    return this.coursesService.createCourse(dto);
  }

  @Put(':id')
  @Roles('admin')
  @Audit('courses', 'update')
  @ApiOperation({ summary: 'Обновить информацию о курсе' })
  async updateCourse(@Param('id') id: string, @Body() dto: any) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('courses', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить курс (мягкое удаление)' })
  async deleteCourse(@Param('id') id: string) {
    await this.coursesService.deleteCourse(id);
  }
}
