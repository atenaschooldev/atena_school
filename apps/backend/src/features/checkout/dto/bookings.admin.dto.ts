import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Статус оплаты (reserved / pending / paid / completed / refunded)', example: 'paid' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Статус оплаты (snake_case)', example: 'paid' })
  @IsOptional()
  @IsString()
  payment_status?: string;

  @ApiPropertyOptional({ description: 'Способ оплаты (cash / pos / stripe / bank_transfer)', example: 'cash' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Способ оплаты (snake_case)', example: 'pos' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Статус составления расписания (scheduled / pending / flexible)', example: 'scheduled' })
  @IsOptional()
  @IsString()
  scheduling_status?: string;
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
  @ApiPropertyOptional({ description: 'Новый статус оплаты бронирования (pending / paid / refunded)', example: 'paid' })
  @IsOptional()
  @IsString()
  payment_status?: string;

  @ApiPropertyOptional({ description: 'Новый статус расписания уроков (scheduled / completed / cancelled)', example: 'scheduled' })
  @IsOptional()
  @IsString()
  scheduling_status?: string;
}
