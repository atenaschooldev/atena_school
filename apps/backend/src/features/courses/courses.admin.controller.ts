import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { CoursesService } from './courses.admin.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { CourseStatus } from '@atena/api-types';

@ApiTags('Admin — Courses')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список курсов (с поддержкой фильтров)' })
  @ApiQuery({ name: 'category', required: false, description: 'Фильтр по категории (например, languages, Certipass)' })
  @ApiQuery({ name: 'status', required: false, enum: CourseStatus, description: 'Статус: 1=ACTIVE, 2=DRAFT, 3=ARCHIVED' })
  @ApiQuery({ name: 'search', required: false, description: 'Текстовый поиск по названию и описанию' })
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

  @Get('categories')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список категорий курсов' })
  async listCategories() {
    return this.coursesService.listCategories();
  }

  @Post('categories')
  @Roles('admin')
  @Audit('courses', 'create_category')
  @ApiOperation({ summary: 'Создать новую категорию курса' })
  async createCategory(@Body() dto: any) {
    return this.coursesService.createCategory(dto);
  }

  @Put('categories/:id')
  @Roles('admin')
  @Audit('courses', 'update_category')
  @ApiOperation({ summary: 'Обновить категорию курса' })
  async updateCategory(@Param('id') id: string, @Body() dto: any) {
    return this.coursesService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Roles('admin')
  @Audit('courses', 'delete_category')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить категорию курса' })
  async deleteCategory(@Param('id') id: string) {
    await this.coursesService.deleteCategory(id);
  }

  @Get('settings')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список пресетов/настроек курсов' })
  async listSettings() {
    return this.coursesService.getAllSettings();
  }

  @Post('settings')
  @Roles('admin')
  @Audit('courses', 'create_settings')
  @ApiOperation({ summary: 'Создать новый пресет настроек курса' })
  async createSettings(@Body() dto: any) {
    return this.coursesService.createSettings(dto);
  }

  @Put('settings/:id')
  @Roles('admin')
  @Audit('courses', 'update_settings')
  @ApiOperation({ summary: 'Обновить пресет настроек курса' })
  async updateSettings(@Param('id') id: string, @Body() dto: any) {
    return this.coursesService.updateSettings(id, dto);
  }

  @Delete('settings/:id')
  @Roles('admin')
  @Audit('courses', 'delete_settings')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить пресет настроек курса' })
  async deleteSettings(@Param('id') id: string) {
    await this.coursesService.deleteSettings(id);
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
