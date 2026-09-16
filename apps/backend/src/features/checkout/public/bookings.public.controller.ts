import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';

@ApiTags('Public — Bookings')
@Controller('bookings')
export class BookingsPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детали квитанции бронирования',
    description: 'Возвращает полную информацию о бронировании для экрана подтверждения заказа',
  })
  @ApiParam({ name: 'id', description: 'UUID бронирования', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Детали бронирования получены',
  })
  async getBookingDetails(@Param('id') id: string) {
    return this.checkoutService.getBookingDetails(id);
  }
}
