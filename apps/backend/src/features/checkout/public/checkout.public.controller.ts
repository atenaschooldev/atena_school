import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto, CustomerPortalDto } from '../dto/checkout.public.dto';

@ApiTags('Landing — Checkout & Payments')
@Controller('landing/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('check-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Проверка оплаты ежегодного взноса €30',
    description: 'Проверяет по Codice Fiscale наличие активного членства в таблицах annual_memberships (2026/2027) и students',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Результат проверки членского взноса',
    schema: {
      example: {
        success: true,
        annualFeePaid: false,
        userFound: false,
        requiresFee: true,
      },
    },
  })
  async checkFee(@Body() dto: CheckFeeDto) {
    return this.checkoutService.checkFeeStatus(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создание бронирования с оплатой в школе (Paga in Sede)',
    description: 'Создает запись бронирования (или N записей для каждого ребенка) в таблице bookings, генерирует уроки в таблице lessons и регистрирует платежные записи',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Бронирование успешно создано',
    schema: {
      example: {
        success: true,
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
        bookingIds: ['550e8400-e29b-41d4-a716-446655440000'],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации входных данных или не удалось создать бронирование',
  })
  async createReservation(@Body() dto: CreateReservationDto) {
    return this.checkoutService.createReservation(dto);
  }

  @Post('stripe-session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Инициализация сессии Stripe Checkout',
    description: 'Создает сессию оплаты Stripe с позициями по каждому студенту и членским взносам, возвращает URL для редиректа на страницу оплаты',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Сессия Stripe создана',
    schema: {
      example: {
        success: true,
        url: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3...',
        bookingId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Онлайн-оплата отключена или произошла ошибка инициализации',
  })
  async createStripeSession(@Body() dto: CreateReservationDto) {
    return this.checkoutService.createStripeSession(dto);
  }

  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Синхронное подтверждение оплаты Stripe',
    description: 'Проверяет статус сессии Stripe после возврата пользователя на экран успеха и переводит бронирование в статус PAID (числовой код 3)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Платеж успешно подтвержден',
    schema: {
      example: {
        success: true,
        booking: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          purchaser_name: 'Mario Rossi',
          purchaser_email: 'mario.rossi@gmail.com',
          payment_status: 3,
          payment_method: 1,
          billing_scheme: 4,
          subscription_status: 1,
          stripe_subscription_id: 'sub_1Qxyz...',
        },
      },
    },
  })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.checkoutService.verifyPayment(dto);
  }

  @Post('customer-portal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Создание сессии Stripe Customer Portal (Self-Service)',
    description: 'Генерирует ссылку на портал самообслуживания Stripe для управления ежемесячной подпиской, смены платежной карты и просмотра счетов',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ссылка на портал Stripe сформирована',
    schema: {
      example: {
        success: true,
        url: 'https://billing.stripe.com/p/session/test_YWNjdF8x...',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Клиент Stripe не найден для указанных параметров',
  })
  async createCustomerPortalSession(@Body() dto: CustomerPortalDto) {
    return this.checkoutService.createCustomerPortalSession(dto);
  }
}

