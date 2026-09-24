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
import { PromoCodesAdminService } from './promo-codes.admin.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidatePromoCodeDto } from '../dto/promo-codes.admin.dto';

@ApiTags('Admin — Promo Codes')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/promo-codes')
export class PromoCodesAdminController {
  constructor(private readonly promoCodesAdminService: PromoCodesAdminService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all promo codes with dynamic usage counts' })
  async listAll() {
    return this.promoCodesAdminService.listAllPromoCodes();
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Validate promo code and compute discount' })
  async validate(@Body() dto: ValidatePromoCodeDto) {
    return this.promoCodesAdminService.validatePromoCode(dto);
  }

  @Post()
  @Roles('admin')
  @Audit('promo_codes', 'CREATE')
  @ApiOperation({ summary: 'Create a new promo code' })
  async create(@Body() dto: CreatePromoCodeDto) {
    return this.promoCodesAdminService.createPromoCode(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @Audit('promo_codes', 'UPDATE')
  @ApiOperation({ summary: 'Update an existing promo code' })
  async update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promoCodesAdminService.updatePromoCode(id, dto);
  }

  @Patch(':id/toggle')
  @Roles('admin')
  @Audit('promo_codes', 'TOGGLE')
  @ApiOperation({ summary: 'Toggle promo code active/inactive status' })
  async toggle(@Param('id') id: string) {
    return this.promoCodesAdminService.togglePromoCode(id);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('promo_codes', 'DELETE')
  @ApiOperation({ summary: 'Delete a promo code' })
  async delete(@Param('id') id: string) {
    return this.promoCodesAdminService.deletePromoCode(id);
  }
}
