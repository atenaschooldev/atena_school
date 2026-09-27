import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { StudentsService } from './students.admin.service';
import { CreateStudentRequestDto, UpdateStudentRequestDto } from './dto/student.dto';
import { StudentStatus, LanguageLevel } from '@atena/api-types';

@ApiTags('Admin — Students')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить реестр студентов (поиск по Codice Fiscale, фильтры)' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по имени, email, телефону или CF' })
  @ApiQuery({ name: 'annualFeePaid', required: false, type: Boolean, description: 'Фильтр по оплате годового взноса' })
  @ApiQuery({ name: 'languageLevel', required: false, enum: LanguageLevel, description: 'Уровень языка: 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2' })
  @ApiQuery({ name: 'status', required: false, enum: StudentStatus, description: 'Статус студента: 1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество записей на странице' })
  async findAll(
    @Query('search') search?: string,
    @Query('annualFeePaid') annualFeePaid?: boolean,
    @Query('languageLevel') languageLevel?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.studentsService.findAll({ search, annualFeePaid, languageLevel, status, page, limit });
  }

  @Get(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить детальную карточку студента по ID' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @Audit('students', 'create')
  @ApiOperation({ summary: 'Создать нового студента в реестре' })
  async create(@Body() dto: CreateStudentRequestDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('students', 'update')
  @ApiOperation({ summary: 'Обновить данные карточки студента' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentRequestDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('students', 'delete')
  @ApiOperation({ summary: 'Удалить студента из реестра' })
  async delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
