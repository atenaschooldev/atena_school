import { Controller, Get, Patch, Param, Query, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { StudentsService } from './students.admin.service';
import { UpdateStudentRequestDto } from './dto/student.dto';

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
  async findAll(
    @Query('search') search?: string,
    @Query('annualFeePaid') annualFeePaid?: boolean,
    @Query('languageLevel') languageLevel?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.studentsService.findAll({ search, annualFeePaid, languageLevel, page, limit });
  }

  @Get(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить детальную карточку студента по ID' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('students', 'update')
  @ApiOperation({ summary: 'Обновить данные карточки студента' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentRequestDto) {
    return this.studentsService.update(id, dto);
  }
}
