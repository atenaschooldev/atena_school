import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Audit } from '../../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../../core/interceptors/audit.interceptor';
import { MarketingPopupsAdminService } from './marketing-popups.admin.service';
import {
  CreateMarketingPopupDto,
  UpdateMarketingPopupDto,
  UploadPopupImageDto,
} from '../dto/marketing-popups.dto';
import { revalidateLanding } from '../../../core/utils/revalidate-landing';

@ApiTags('Admin — Marketing Popups')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/marketing-popups')
export class MarketingPopupsAdminController {
  constructor(private readonly marketingPopupsService: MarketingPopupsAdminService) {}

  @Get()
  @Roles('admin', 'superadmin', 'director')
  @ApiOperation({ summary: 'List all marketing popups' })
  async listAll() {
    return this.marketingPopupsService.listAllPopups();
  }

  @Post()
  @Roles('admin', 'superadmin', 'director')
  @Audit('marketing_popups', 'CREATE')
  @ApiOperation({ summary: 'Create a new marketing popup' })
  async create(@Body() dto: CreateMarketingPopupDto) {
    const created = await this.marketingPopupsService.createPopup(dto);
    revalidateLanding({ tag: 'marketing-popups' }).catch(() => {});
    return created;
  }

  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'superadmin', 'director')
  @ApiOperation({ summary: 'Upload popup image to Supabase storage CDN' })
  async uploadImage(@Body() dto: UploadPopupImageDto) {
    return this.marketingPopupsService.uploadImage(dto.dataUrl, dto.fileName);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin', 'director')
  @Audit('marketing_popups', 'UPDATE')
  @ApiOperation({ summary: 'Update an existing marketing popup' })
  async update(@Param('id') id: string, @Body() dto: UpdateMarketingPopupDto) {
    const updated = await this.marketingPopupsService.updatePopup(id, dto);
    revalidateLanding({ tag: 'marketing-popups' }).catch(() => {});
    return updated;
  }

  @Patch(':id/toggle')
  @Roles('admin', 'superadmin', 'director')
  @Audit('marketing_popups', 'TOGGLE')
  @ApiOperation({ summary: 'Toggle popup active / inactive status' })
  async toggle(@Param('id') id: string) {
    const toggled = await this.marketingPopupsService.togglePopup(id);
    revalidateLanding({ tag: 'marketing-popups' }).catch(() => {});
    return toggled;
  }

  @Delete(':id')
  @Roles('admin', 'superadmin', 'director')
  @Audit('marketing_popups', 'DELETE')
  @ApiOperation({ summary: 'Delete a marketing popup' })
  async delete(@Param('id') id: string) {
    const res = await this.marketingPopupsService.deletePopup(id);
    revalidateLanding({ tag: 'marketing-popups' }).catch(() => {});
    return res;
  }
}
