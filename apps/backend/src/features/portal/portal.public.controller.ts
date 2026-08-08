import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PortalService } from './portal.public.service';
import { UpdateProfileDto } from './dto/portal.dto';

@ApiTags('Student & Parent Portal (LK)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Получение обогащенного дашборда ученика/родителя' })
  async getDashboardData(@Req() req: any) {
    return this.portalService.getDashboardData(req.user);
  }

  @Get('bookings/:id/lessons')
  @ApiOperation({ summary: 'Получение расписания уроков для курса' })
  async getBookingLessons(@Param('id') bookingId: string, @Req() req: any) {
    return this.portalService.getBookingLessons(bookingId, req.user);
  }

  @Post('bookings/:id/schedule-lesson')
  @ApiOperation({ summary: 'Запланировать следующий урок для бронирования' })
  async scheduleNextLesson(
    @Param('id') bookingId: string,
    @Body() body: { dateStr: string; timeStr: string },
    @Req() req: any,
  ) {
    return this.portalService.scheduleNextLesson(bookingId, body.dateStr, body.timeStr, req.user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Обновление имени и телефона профиля' })
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return this.portalService.updateProfile(req.user, dto);
  }
}
