import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  PaymentCurrency,
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
} from '@atena/api-types';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsInt()
  currency?: PaymentCurrency;

  @IsInt()
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsInt()
  type?: PaymentType;

  @IsOptional()
  @IsInt()
  status?: PaymentRecordStatus;

  @IsOptional()
  @IsInt()
  provider?: PaymentProvider;

  @IsOptional()
  @IsString()
  providerTransactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsInt()
  status?: PaymentRecordStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsInt()
  type?: PaymentType;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  paidAt?: string;
}

export * from './pos-checkout.dto';

