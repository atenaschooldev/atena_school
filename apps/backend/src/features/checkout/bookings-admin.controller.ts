import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { CheckoutService } from './checkout.service';
import { BookingsAdminService } from './bookings-admin.service';

class UpdateBookingStatusDto {
  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  scheduling_status?: string;
}

@ApiTags('Admin — Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/bookings')
export class BookingsAdminController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly bookingsAdminService: BookingsAdminService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить все бронирования (только для админа)' })
  async listAllBookings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsAdminService.listAllBookings({ page, limit, search, status });
  }

  @Get('check-membership')
  @Roles('admin')
  @ApiOperation({ summary: 'Проверить статус взноса по email / taxCode' })
  async checkMembership(@Query('email') email?: string, @Query('taxCode') taxCode?: string) {
    return this.checkoutService.checkFeeStatus({ email, taxCode });
  }

  @Get('lookup-client')
  @Roles('admin')
  @ApiOperation({ summary: 'Найти клиента по email / taxCode / phone' })
  async lookupClient(@Query('q') q: string) {
    return this.bookingsAdminService.lookupClient(q);
  }

  @Post()
  @Roles('admin')
  @Audit('bookings', 'create')
  @ApiOperation({ summary: 'Создать ручное бронирование (админ)' })
  async createManualBooking(@Body() dto: any) {
    return this.bookingsAdminService.createAdminBooking(dto);
  }

  @Patch(':id/status')
  @Roles('admin')
  @Audit('bookings', 'update_status')
  @ApiOperation({ summary: 'Обновить статус оплаты / расписания бронирования' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsAdminService.updateBookingPaymentStatus(id, dto);
  }

  @Get(':id/lessons')
  @Roles('admin')
  @ApiOperation({ summary: 'Получить уроки бронирования с финансовым статусом' })
  async getBookingLessons(@Param('id') id: string) {
    return this.bookingsAdminService.getBookingLessons(id);
  }

  @Patch(':id/lessons/:lessonId/complete')
  @Roles('admin')
  @Audit('lessons', 'complete')
  @ApiOperation({ summary: 'Отметить урок как проведённый и создать начисление (поурочная оплата)' })
  async completeLesson(
    @Param('id') bookingId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: { payment_method?: string },
  ) {
    return this.bookingsAdminService.completeLesson(bookingId, lessonId, dto.payment_method);
  }

  @Patch(':id/lessons/:lessonId/pay')
  @Roles('admin')
  @Audit('lessons', 'pay')
  @ApiOperation({ summary: 'Принять оплату за проведённый урок' })
  async payLesson(
    @Param('id') bookingId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: { payment_method?: string; amount?: number },
  ) {
    return this.bookingsAdminService.payLesson(bookingId, lessonId, dto.payment_method, dto.amount);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('bookings', 'delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить бронирование и связанные уроки / membership' })
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsAdminService.deleteBooking(id);
  }
}
