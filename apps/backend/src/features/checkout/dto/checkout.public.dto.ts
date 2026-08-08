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
