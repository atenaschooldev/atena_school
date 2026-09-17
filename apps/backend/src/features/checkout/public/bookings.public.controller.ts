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
    description: 'Возвращает полную информацию о бронировании, платежах и сгенерированных уроках для экрана подтверждения заказа',
  })
  @ApiParam({ name: 'id', description: 'UUID бронирования', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Детали бронирования успешно получены',
    schema: {
      example: {
        success: true,
        booking: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          course_id: 'cor-inglese-a1',
          course_name: 'Inglese A1 Principianti',
          purchaser_name: 'Mario Rossi',
          purchaser_email: 'mario.rossi@gmail.com',
          purchaser_phone: '+39 375 605 2362',
          student_name: 'Luca Rossi',
          student_tax_code: 'RSSLCU10A01H501Z',
          amount_paid: 270,
          registration_fee: 30,
          course_price: 240,
          payment_status: 1,
          payment_method: 1,
          billing_scheme: 4,
          subscription_status: 1,
          stripe_subscription_id: 'sub_1Qxyz...',
          start_date: '2026-10-01',
          lessons_count: 8,
          lessons: [
            {
              id: 'les_1',
              starts_at: '2026-10-01T16:00:00Z',
              ends_at: '2026-10-01T17:00:00Z',
              status: 1,
            },
          ],
          payments: [
            {
              id: 'pay_1',
              amount: 240,
              type: 1,
              status: 1,
              payment_method: 1,
              created_at: '2026-09-17T18:00:00Z',
            },
            {
              id: 'pay_2',
              amount: 30,
              type: 2,
              status: 1,
              payment_method: 1,
              created_at: '2026-09-17T18:00:00Z',
            },
          ],
        },
      },
    },
  })
  async getBookingDetails(@Param('id') id: string) {
    return this.checkoutService.getBookingDetails(id);
  }
}
