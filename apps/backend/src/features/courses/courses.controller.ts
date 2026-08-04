import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { CoursesService } from './courses.service';

export class CreateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber()
  lessonsPerWeek?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  scheduleType?: string;

  @IsOptional()
  @IsNumber()
  totalLessons?: number;

  @IsOptional()
  @IsArray()
  scheduleDays?: any[];

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  lessonDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @IsOptional()
  @IsString()
  courseFormat?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateCourseDto extends CreateCourseDto {}

@ApiTags('Admin — Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список курсов (с поддержкой фильтров)' })
  async listCourses(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.listCourses({ category, status, search });
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
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Put(':id')
  @Roles('admin')
  @Audit('courses', 'update')
  @ApiOperation({ summary: 'Обновить информацию о курсе' })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
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
