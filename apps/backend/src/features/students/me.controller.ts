import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { StudentsService } from './students.service';
import { IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  profileName: string;

  @IsString()
  profilePhone: string;
}

@ApiTags('Student & Parent LK')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/v1/me')
export class MeController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Получение обогащенного дашборда ученика/родителя' })
  async getDashboardData(@Req() req: any) {
    const user = req.user;
    return this.studentsService.getDashboardData(user);
  }

  @Get('bookings/:id/lessons')
  @ApiOperation({ summary: 'Получение полного расписания уроков для курса' })
  async getBookingLessons(@Param('id') bookingId: string, @Req() req: any) {
    return this.studentsService.getBookingLessons(bookingId, req.user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Обновление имени и телефона профиля' })
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return this.studentsService.updateProfile(req.user, dto);
  }
}
