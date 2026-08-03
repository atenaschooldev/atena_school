import { Body, Controller, Post, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CheckFeeDto {
  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateReservationDto {
  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isForChild?: boolean;

  @IsOptional()
  @IsString()
  studentFirstName?: string;

  @IsOptional()
  @IsString()
  studentLastName?: string;

  @IsOptional()
  @IsString()
  studentEmail?: string;

  @IsOptional()
  @IsString()
  studentPhone?: string;

  @IsOptional()
  @IsString()
  purchaserTaxCode?: string;

  @IsOptional()
  @IsString()
  studentTaxCode?: string;

  @IsOptional()
  @IsString()
  studentBirthDate?: string;

  @IsOptional()
  @IsBoolean()
  needsCompanyInvoice?: boolean;

  @IsOptional()
  @IsString()
  sdiCode?: string;

  @IsOptional()
  @IsString()
  pecEmail?: string;

  @IsOptional()
  @IsBoolean()
  includeRegistrationFee?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class VerifyPaymentDto {
  @IsString()
  sessionId: string;

  @IsString()
  bookingId: string;
}

export class ContactFormDto {
  @IsString()
  nome: string;

  @IsString()
  cognome: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  interesse?: string;

  @IsString()
  messaggio: string;
}

@ApiTags('Public Landing Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('check-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверка оплаты ежегодного взноса €30' })
  async checkFee(@Body() dto: CheckFeeDto) {
    return this.checkoutService.checkFeeStatus(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание бронирования без онлайн оплаты (Paga in Sede)' })
  async createReservation(@Body() dto: CreateReservationDto) {
    return this.checkoutService.createReservation(dto);
  }

  @Post('create-stripe-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Инициализация Stripe Checkout сессии' })
  async createStripeSession(@Body() dto: CreateReservationDto) {
    return this.checkoutService.createStripeSession(dto);
  }

  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Синхронное подтверждение оплаты Stripe' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.checkoutService.verifyPayment(dto);
  }

  @Get('item/:id')
  @ApiOperation({ summary: 'Получить публичную информацию о курсе по ID или slug' })
  async getItem(@Param('id') id: string) {
    return this.checkoutService.getItem(id);
  }

  @Get('booking-details/:id')
  @ApiOperation({ summary: 'Получить детали квитанции для экрана успеха' })
  async getBookingDetails(@Param('id') id: string) {
    return this.checkoutService.getBookingDetails(id);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Получить полный список активных витринных курсов' })
  async getPublicCourses() {
    return this.checkoutService.getPublicCourses();
  }

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправка формы обратной связи' })
  async submitContact(@Body() dto: ContactFormDto) {
    return this.checkoutService.submitContact(dto);
  }
}
