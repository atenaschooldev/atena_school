import { Body, Controller, Get, Patch, Post, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from '../public/checkout.public.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Audit } from '../../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../../core/interceptors/audit.interceptor';

import { revalidateLanding } from '../../../core/utils/revalidate-landing';

@ApiTags('Admin — Settings & School Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin/settings')
export class SettingsAdminController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(['payment-gateway', ''])
  @ApiOperation({
    summary: 'Получить настройки платежного шлюза (Admin)',
    description: 'Возвращает текущие настройки шлюзов Stripe и регулярных подписок',
  })
  async getPaymentGateway() {
    const settings = await this.checkoutService.getSettings();
    return { success: true, settings };
  }

  @Patch(['payment-gateway', ''])
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'superadmin', 'director')
  @UseInterceptors(AuditInterceptor)
  @Audit('system_settings', 'UPDATE')
  @ApiOperation({
    summary: 'Обновить настройки платежного шлюза и подписок (Admin)',
    description: 'Позволяет администратору включить или выключить Stripe шлюз и регулярные подписки',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripeEnabled: { type: 'boolean', example: true, description: 'Флаг активности Stripe онлайн-оплаты' },
        subscriptionsEnabled: { type: 'boolean', example: true, description: 'Флаг активности ежемесячных подписок' },
      },
    },
  })
  async updatePaymentGateway(@Body() body: { stripeEnabled?: boolean; subscriptionsEnabled?: boolean }) {
    const settings = await this.checkoutService.updateSettings(body);
    revalidateLanding({ tag: 'payment-settings' }).catch(() => {});
    return { success: true, settings };
  }

  @Get('school-profile')
  @ApiOperation({
    summary: 'Получить профиль и реквизиты школы (Admin)',
    description: 'Возвращает полные настройки профиля школы, контакты, соцсети и размер членского взноса',
  })
  async getSchoolProfile() {
    const profile = await this.checkoutService.getSchoolProfile();
    return { success: true, profile };
  }

  @Patch('school-profile')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'superadmin', 'director')
  @UseInterceptors(AuditInterceptor)
  @Audit('school_profile', 'UPDATE')
  @ApiOperation({
    summary: 'Обновить профиль и реквизиты школы (Admin)',
    description: 'Обновляет профиль школы (IBAN, контакты, соцсети, бренд) в базе данных',
  })
  async updateSchoolProfile(@Body() body: any) {
    const profile = await this.checkoutService.updateSchoolProfile(body);
    revalidateLanding({ tag: 'school-profile' }).catch(() => {});
    return { success: true, profile };
  }

  @Post('school-profile/logo')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'superadmin', 'director')
  @ApiOperation({
    summary: 'Загрузить логотип школы в Supabase Storage',
    description: 'Принимает Base64 Data URL, загружает файл в бакет brand-assets и возвращает постоянный публичный CDN URL',
  })
  async uploadSchoolLogo(@Body() body: { dataUrl: string; fileName?: string }) {
    const result = await this.checkoutService.uploadLogoAsset(body.dataUrl, body.fileName);
    return { success: true, url: result.url };
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Получить настройки веб-аналитики (Admin)',
    description: 'Возвращает активные ID трекинга (GA4, GTM, Clarity, Pixel)',
  })
  async getAnalyticsSettings() {
    const analytics = await this.checkoutService.getAnalyticsSettings();
    return { success: true, analytics };
  }

  @Get('domains')
  @ApiOperation({
    summary: 'Получить домены и URL школы (Admin)',
    description: 'Возвращает siteUrl, appUrl, adminUrl для ссылок и переходов между приложениями',
  })
  async getDomainsSettings() {
    const domains = await this.checkoutService.getDomainsSettings();
    return { success: true, domains };
  }
}
