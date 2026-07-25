import { Body, Controller, Post, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
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
}

export class VerifyPaymentDto {
  @IsString()
  sessionId: string;

  @IsString()
  bookingId: string;
}

@ApiTags('Checkout & Payments')
@Controller('api/v1/checkout')
export class CheckoutController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('check-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверка оплаты ежегодного взноса €30' })
  async checkFee(@Body() dto: CheckFeeDto) {
    return this.paymentsService.checkFeeStatus(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание бронирования без онлайн оплаты (Paga in Sede)' })
  async createReservation(@Body() dto: CreateReservationDto) {
    return this.paymentsService.createReservation(dto);
  }

  @Post('create-stripe-session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Инициализация Stripe Checkout сессии' })
  async createStripeSession(@Body() dto: CreateReservationDto) {
    return this.paymentsService.createStripeSession(dto);
  }

  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Синхронное подтверждение оплаты Stripe' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }
}
