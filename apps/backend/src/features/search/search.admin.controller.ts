import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { SearchService, GlobalSearchResult } from './search.admin.service';

@ApiTags('Admin — Search')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Глобальный глубокий поиск по всей базе данных (студенты, платежи, Stripe ID, брони, группы, курсы)' })
  @ApiQuery({ name: 'q', required: true, description: 'Поисковый запрос (любые данные)' })
  async search(@Query('q') q: string): Promise<GlobalSearchResult[]> {
    return this.searchService.globalSearch(q);
  }
}
