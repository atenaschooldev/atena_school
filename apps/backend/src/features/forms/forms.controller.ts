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
import { FormsService } from './forms.service';
import {
  CreateFormTemplateDto,
  UpdateFormTemplateDto,
  ResolveFormQueryDto,
} from './dto/forms.dto';
import { FormType } from '@atena/api-types';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';

@ApiTags('Forms — Public & Resolution')
@Controller(['forms', 'landing/forms'])
export class FormsPublicController {
  constructor(private readonly formsService: FormsService) {}

  @Get('resolve')
  @ApiOperation({ summary: 'Разрешить активный шаблон формы для курса/категории (Public)' })
  async resolveForm(
    @Query('form_type') form_type: FormType = FormType.BOOKING,
    @Query('course_id') course_id?: string,
    @Query('category_slug') category_slug?: string,
  ) {
    const template = await this.formsService.resolveForm({
      form_type,
      course_id,
      category_slug,
    });
    return {
      success: true,
      template,
    };
  }
}

@ApiTags('Admin — Forms Engine')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/forms')
export class FormsAdminController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить список всех шаблонов форм' })
  async getForms(
    @Query('form_type') form_type?: FormType,
    @Query('is_active') is_active?: string,
  ) {
    const isActiveBool = is_active !== undefined ? is_active === 'true' : undefined;
    return this.formsService.getForms({ form_type, is_active: isActiveBool });
  }

  @Post()
  @Roles('admin')
  @Audit('forms', 'create_form')
  @ApiOperation({ summary: 'Создать новый шаблон формы' })
  async createForm(@Body() dto: CreateFormTemplateDto) {
    return this.formsService.createForm(dto);
  }

  @Get(':id')
  @Roles('admin', 'secretary')
  @ApiOperation({ summary: 'Получить шаблон формы по ID' })
  async getFormById(@Param('id') id: string) {
    return this.formsService.getFormById(id);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('forms', 'update_form')
  @ApiOperation({ summary: 'Обновить шаблон формы' })
  async updateForm(
    @Param('id') id: string,
    @Body() dto: UpdateFormTemplateDto,
  ) {
    return this.formsService.updateForm(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('forms', 'delete_form')
  @ApiOperation({ summary: 'Удалить шаблон формы' })
  async deleteForm(@Param('id') id: string) {
    return this.formsService.deleteForm(id);
  }

  @Post(':id/set-default')
  @Roles('admin')
  @Audit('forms', 'set_default_form')
  @ApiOperation({ summary: 'Установить форму дефолтной' })
  async setDefaultForm(@Param('id') id: string) {
    return this.formsService.setDefaultForm(id);
  }

  @Post(':id/duplicate')
  @Roles('admin')
  @Audit('forms', 'duplicate_form')
  @ApiOperation({ summary: 'Дублировать форму' })
  async duplicateForm(@Param('id') id: string) {
    return this.formsService.duplicateForm(id);
  }
}
