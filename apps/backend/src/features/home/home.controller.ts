import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { HomeService } from './home.service';

@ApiTags('Admin — Dashboard / Home')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller(['admin/home/dashboard', 'home/dashboard'])
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить статистику для дашборда главной страницы' })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  async getDashboardStats() {
    return this.homeService.getDashboardStats();
  }
}
