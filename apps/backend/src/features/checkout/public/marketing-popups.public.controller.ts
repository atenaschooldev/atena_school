import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MarketingPopupsAdminService } from '../admin/marketing-popups.admin.service';

@ApiTags('Public — Marketing Popups')
@Controller(['landing/marketing-popups', 'v1/landing/marketing-popups'])
export class MarketingPopupsPublicController {
  constructor(private readonly marketingPopupsService: MarketingPopupsAdminService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Get currently active marketing popup for landing',
    description: 'Returns active popup matching current route, schedule dates and priority',
  })
  @ApiQuery({ name: 'route', required: false, description: 'Current landing route (e.g. / or /corsi)' })
  @ApiQuery({ name: 'device', required: false, description: 'Client device type (desktop | mobile | all)' })
  @ApiQuery({ name: 'lang', required: false, description: 'Current language locale (e.g. it or en)' })
  async getActive(
    @Query('route') route?: string,
    @Query('device') device?: 'desktop' | 'mobile' | 'all',
    @Query('lang') lang?: string
  ) {
    const popup = await this.marketingPopupsService.getActivePopup(
      route || '/',
      device || 'all',
      lang || '*'
    );
    return { success: true, popup };
  }
}
