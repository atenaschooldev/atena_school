import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { GroupsService } from './groups.admin.service';
import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto } from './dto/group.dto';

@ApiTags('Admin — Groups')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить список групп с фильтрацией' })
  @ApiQuery({ name: 'courseId', required: false, description: 'UUID курса' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'UUID преподавателя' })
  @ApiQuery({ name: 'status', required: false, description: 'Статус группы' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
  async listGroups(
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.groupsService.listGroups({
      courseId,
      teacherId,
      status: status ? Number(status) : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student', 'parent')
  @ApiOperation({ summary: 'Получить детальную информацию о группе' })
  async getGroup(@Param('id') id: string) {
    return this.groupsService.getGroup(id);
  }

  @Post()
  @Roles('admin')
  @Audit('groups', 'create')
  @ApiOperation({ summary: 'Создать новую учебную группу' })
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(dto);
  }

  @Put(':id')
  @Roles('admin')
  @Audit('groups', 'update')
  @ApiOperation({ summary: 'Обновить данные учебной группы' })
  async updateGroup(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.updateGroup(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('groups', 'delete')
  @ApiOperation({ summary: 'Удалить учебную группу' })
  async deleteGroup(@Param('id') id: string) {
    return this.groupsService.deleteGroup(id);
  }

  @Post(':id/members')
  @Roles('admin')
  @Audit('groups', 'add_member')
  @ApiOperation({ summary: 'Добавить ученика в группу' })
  async addMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto) {
    return this.groupsService.addMember(id, dto);
  }

  @Delete(':id/members/:studentId')
  @Roles('admin')
  @Audit('groups', 'remove_member')
  @ApiOperation({ summary: 'Удалить ученика из группы' })
  async removeMember(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.groupsService.removeMember(id, studentId);
  }
}
