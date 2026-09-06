import { Body, Controller, Post, Get, Patch, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CheckoutService } from './checkout.public.service';
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto, ContactFormDto } from '../dto/checkout.public.dto';

@ApiTags('Landing — Checkout & Catalog')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Получить настройки чекаута',
    description: 'Возвращает состояние платежного шлюза Stripe (включен/отключен) для отображения на форме чекаута лендинга',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки чекаута успешно получены',
    schema: {
      example: {
        success: true,
        settings: {
          stripeEnabled: true,
        },
      },
    },
  })
  async getSettings() {
    const settings = await this.checkoutService.getSettings();
    return { success: true, settings };
  }

  @Patch('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновить настройки чекаута',
    description: 'Позволяет включить или выключить Stripe шлюз на чекауте',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripeEnabled: { type: 'boolean', example: true, description: 'Флаг активности Stripe' },
      },
      required: ['stripeEnabled'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно обновлены',
    schema: { example: { success: true, settings: { stripeEnabled: true } } },
  })
  async updateSettings(@Body() body: { stripeEnabled: boolean }) {
    const settings = await this.checkoutService.updateSettings(body);
    return { success: true, settings };
  }

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

  @Post('create-stripe-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Инициализация сессии Stripe Checkout',
    description: 'Создает сессию оплаты Stripe с позициями по каждому студенту и членским взносам, возвращает URL для редиректа на страницу оплаты',
  })
  @ApiResponse({
    status: HttpStatus.OK,
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
    description: 'Проверяет статус сессии Stripe после возврата пользователя на экран успеха и переводит бронирование в статус paid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Платеж успешно подтвержден',
    schema: {
      example: {
        success: true,
        booking: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          payment_status: 'paid',
        },
      },
    },
  })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.checkoutService.verifyPayment(dto);
  }

  @Get('item/:id')
  @ApiOperation({
    summary: 'Получить публичную информацию о курсе',
    description: 'Возвращает карточку курса по ID (UUID) или slug с информацией о преподавателе',
  })
  @ApiParam({ name: 'id', description: 'UUID или slug курса (напр. b1-preliminary)', example: 'b1-preliminary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о курсе найдена',
    schema: {
      example: {
        success: true,
        item: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Corso di Inglese B1 Preliminary',
          slug: 'b1-preliminary',
          price: 240,
          category: 'languages',
          teacher_name: 'Sarah Jenkins',
        },
      },
    },
  })
  async getItem(@Param('id') id: string) {
    return this.checkoutService.getItem(id);
  }

  @Get('booking-details/:id')
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

  @Get('courses')
  @ApiOperation({
    summary: 'Получить полный каталог активных курсов',
    description: 'Возвращает список всех активных курсов школы с привязанными преподавателями',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список курсов успешно получен',
  })
  async getPublicCourses() {
    return this.checkoutService.getPublicCourses();
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Отправка формы обратной связи',
    description: 'Сохраняет входящую заявку/сообщение в таблицу contact_messages для обработки секретариатом',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сообщение успешно сохранено',
    schema: { example: { success: true, message: 'Сообщение успешно отправлено' } },
  })
  async submitContact(@Body() dto: ContactFormDto) {
    return this.checkoutService.submitContact(dto);
  }
}

