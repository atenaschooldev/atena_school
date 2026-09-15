import { IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '@atena/api-types';

export class PosCheckoutItemDto {
  @ApiProperty({
    enum: PaymentType,
    description: 'Тип платежа (1=COURSE, 2=REG_FEE, 3=INSTALLMENT...)',
    example: 1,
  })
  @IsInt()
  type: PaymentType;

  @ApiProperty({
    description: 'Сумма позиции в евро',
    example: 150.0,
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Описание позиции',
    example: 'Corso Individuale Inglese A1',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PosCheckoutDto {
  @ApiPropertyOptional({
    description: 'ID бронирования (если применимо)',
    example: 'd5e6f7a8-b9c0-1234-def0-567890123456',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({
    description: 'ID студента',
    example: 'd5e6f7a8-b9c0-1234-def0-567890123456',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'ФИО плательщика',
    example: 'Mario Rossi',
  })
  @IsOptional()
  @IsString()
  purchaserName?: string;

  @ApiPropertyOptional({
    description: 'Email плательщика',
    example: 'mario.rossi@gmail.com',
  })
  @IsOptional()
  @IsString()
  purchaserEmail?: string;

  @ApiPropertyOptional({
    description: 'Codice Fiscale плательщика',
    example: 'RSSMRA80A01H501T',
  })
  @IsOptional()
  @IsString()
  purchaserTaxCode?: string;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Способ оплаты (1=STRIPE, 2=CASH, 3=POS, 4=BANK_TRANSFER)',
    example: 3,
  })
  @IsInt()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    type: [PosCheckoutItemDto],
    description: 'Список позиций чека для оплаты',
  })
  @ValidateNested({ each: true })
  @Type(() => PosCheckoutItemDto)
  items: PosCheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'Дополнительные примечания',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
