import { IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  purchaserName?: string;

  @IsOptional()
  @IsString()
  purchaser_name?: string;

  @IsOptional()
  @IsString()
  purchaserEmail?: string;

  @IsOptional()
  @IsString()
  purchaser_email?: string;

  @IsOptional()
  @IsString()
  purchaserPhone?: string;

  @IsOptional()
  @IsString()
  purchaser_phone?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  scheduling_status?: string;
}

export class AdminMembershipFeeDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class UpdateBookingStatusDto {
  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  scheduling_status?: string;
}
