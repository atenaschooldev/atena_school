import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import {
  BookingPaymentStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  SubscriptionStatus,
} from '@atena/api-types';

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Имя и фамилия покупателя / родителя', example: 'Mario Rossi' })
  @IsOptional()
  @IsString()
  purchaserName?: string;

  @ApiPropertyOptional({ description: 'Имя и фамилия покупателя (snake_case)', example: 'Mario Rossi' })
  @IsOptional()
  @IsString()
  purchaser_name?: string;

  @ApiPropertyOptional({ description: 'Email покупателя', example: 'mario.rossi@gmail.com' })
  @IsOptional()
  @IsString()
  purchaserEmail?: string;

  @ApiPropertyOptional({ description: 'Email покупателя (snake_case)', example: 'mario.rossi@gmail.com' })
  @IsOptional()
  @IsString()
  purchaser_email?: string;

  @ApiPropertyOptional({ description: 'Телефон покупателя', example: '+39 375 605 2362' })
  @IsOptional()
  @IsString()
  purchaserPhone?: string;

  @ApiPropertyOptional({ description: 'Телефон покупателя (snake_case)', example: '+39 375 605 2362' })
  @IsOptional()
  @IsString()
  purchaser_phone?: string;

  @ApiPropertyOptional({
    description: 'Статус оплаты: 1=PENDING, 2=RESERVED, 3=PAID, 4=REFUNDED, 5=PARTIALLY_REFUNDED, 6=FAILED, 7=CANCELLED',
    enum: BookingPaymentStatus,
    example: BookingPaymentStatus.PAID,
  })
  @IsOptional()
  @IsInt({ message: 'payment_status должен быть числом (1..7)' })
  payment_status?: BookingPaymentStatus;

  @ApiPropertyOptional({
    description: 'Способ оплаты: 1=STRIPE, 2=CASH, 3=POS, 4=BANK_TRANSFER',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsInt({ message: 'payment_method должен быть числом (1..4)' })
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Статус составления расписания: 1=SCHEDULED, 2=PENDING_COORDINATION',
    enum: BookingSchedulingStatus,
    example: BookingSchedulingStatus.SCHEDULED,
  })
  @IsOptional()
  @IsInt({ message: 'scheduling_status должен быть числом (1..2)' })
  scheduling_status?: BookingSchedulingStatus;

  @ApiPropertyOptional({
    description: 'Схема оплаты: 1=FULL, 2=INSTALLMENTS, 3=PER_LESSON, 4=SUBSCRIPTION',
    enum: BillingScheme,
    example: BillingScheme.SUBSCRIPTION,
  })
  @IsOptional()
  @IsInt({ message: 'billing_scheme должен быть числом (1..4)' })
  billing_scheme?: BillingScheme;

  @ApiPropertyOptional({
    description: 'Статус ежемесячной подписки: 1=ACTIVE, 2=PENDING_RECEPTION_PAYMENT, 3=PAST_DUE, 4=PAUSED, 5=CANCELED, 6=EXPIRED',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsInt({ message: 'subscription_status должен быть числом (1..6)' })
  subscription_status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Флаг отмены подписки в конце расчетного периода',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  cancel_at_period_end?: boolean;
}

export class AdminMembershipFeeDto {
  @ApiPropertyOptional({ description: 'ID студента в таблице students', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Полное имя студента', example: 'Luca Rossi' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email студента', example: 'luca.rossi@gmail.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон студента', example: '+39 340 1234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Codice Fiscale студента', example: 'RSSLCU10A01H501Z' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Дата рождения студента (ГГГГ-ММ-ДД)', example: '2012-05-15' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Способ оплаты членского взноса (€30)', example: 'cash' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class UpdateBookingStatusDto {
  @ApiPropertyOptional({
    description: 'Новый статус оплаты бронирования: 1=PENDING, 2=RESERVED, 3=PAID, 4=REFUNDED, 5=PARTIALLY_REFUNDED, 6=FAILED, 7=CANCELLED',
    enum: BookingPaymentStatus,
    example: BookingPaymentStatus.PAID,
  })
  @IsOptional()
  @IsInt({ message: 'payment_status должен быть числом (1..7)' })
  payment_status?: BookingPaymentStatus;

  @ApiPropertyOptional({
    description: 'Новый статус расписания уроков: 1=SCHEDULED, 2=PENDING_COORDINATION',
    enum: BookingSchedulingStatus,
    example: BookingSchedulingStatus.SCHEDULED,
  })
  @IsOptional()
  @IsInt({ message: 'scheduling_status должен быть числом (1..2)' })
  scheduling_status?: BookingSchedulingStatus;

  @ApiPropertyOptional({
    description: 'Новый статус подписки: 1=ACTIVE, 2=PENDING_RECEPTION_PAYMENT, 3=PAST_DUE, 4=PAUSED, 5=CANCELED, 6=EXPIRED',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsInt({ message: 'subscription_status должен быть числом (1..6)' })
  subscription_status?: SubscriptionStatus;
}
