import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';
import { BookingDetailsResponseDto } from '../dto/checkout.public.dto';

@ApiTags('Landing — Checkout & Bookings')
@Controller('landing/bookings')
export class BookingsPublicController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детали бронирования, квитанцию и график уроков',
    description:
      'Возвращает полный снимок бронирования: статус, финансовый расчёт (€30 ассоциативный взнос + стоимость курса), историю платежей и точные даты сгенерированных уроков. Используется на экране подтверждения заказа (checkout/success) и в кабинете студента.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID бронирования (таблица bookings)',
    example: '2facd0ef-aa4d-4afc-be62-30b75c9f4c6a',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Детали бронирования и расписание уроков успешно получены',
    type: BookingDetailsResponseDto,
  })
  async getBookingDetails(@Param('id') id: string) {
    return this.checkoutService.getBookingDetails(id);
  }
}
