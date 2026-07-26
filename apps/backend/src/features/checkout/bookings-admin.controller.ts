import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { CheckoutService } from './checkout.service';

class UpdateBookingStatusDto {
  @IsString()
  payment_status: string;

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
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Получить все бронирования (только для админа)' })
  async listAllBookings() {
    return this.checkoutService.listAllBookings();
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Обновить статус оплаты / расписания бронирования' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.checkoutService.updateBookingPaymentStatus(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @Audit('bookings', 'delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить бронирование и связанные уроки / membership' })
  async deleteBooking(@Param('id') id: string) {
    return this.checkoutService.deleteBooking(id);
  }
}
