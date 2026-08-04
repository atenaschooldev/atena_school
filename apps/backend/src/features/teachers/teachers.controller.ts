import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { TeachersService } from './teachers.service';

export class CreateTeacherDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateTeacherDto extends CreateTeacherDto {}

@ApiTags('Admin — Teachers')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить список преподавателей (с фильтрацией и поиском)' })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.teachersService.findAll({ status, search });
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить информацию о преподавателе по ID' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @Audit('teachers', 'create')
  @ApiOperation({ summary: 'Создать профиль преподавателя' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('teachers', 'update')
  @ApiOperation({ summary: 'Обновить профиль преподавателя' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('teachers', 'delete')
  @ApiOperation({ summary: 'Удалить профиль преподавателя' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
