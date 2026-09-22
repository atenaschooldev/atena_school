import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.admin.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

@ApiTags('Admin — Users & Permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'director', 'superadmin')
  @ApiOperation({ summary: 'Получить список всех пользователей и сотрудников' })
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  @Roles('admin', 'director', 'superadmin')
  @ApiOperation({ summary: 'Получить профиль пользователя по ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('admin', 'director', 'superadmin')
  @Audit('users', 'CREATE')
  @ApiOperation({ summary: 'Создать нового пользователя/сотрудника' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'director', 'superadmin')
  @Audit('users', 'UPDATE')
  @ApiOperation({ summary: 'Обновить данные или роль пользователя' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'director', 'superadmin')
  @Audit('users', 'DELETE')
  @ApiOperation({ summary: 'Удалить пользователя из системы' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
