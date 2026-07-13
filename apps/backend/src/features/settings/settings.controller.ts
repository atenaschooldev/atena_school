import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить настройки текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки успешно получены' })
  async getSettings(@Req() req: any) {
    return this.settingsService.getSettings(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Обновить настройки текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки успешно обновлены' })
  async updateSettings(@Req() req: any, @Body() settingsDto: any) {
    return this.settingsService.updateSettings(req.user.id, settingsDto);
  }
}
