import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'ESTATE2026', description: 'Codice promozionale unico' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Sconto estivo 15%', description: 'Descrizione del codice promozionale' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: '1=Percentuale (%), 2=Importo Fisso (€)' })
  @IsInt()
  @Type(() => Number)
  discount_type: number;

  @ApiProperty({ example: 15, description: 'Valore dello sconto' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount_value: number;

  @ApiPropertyOptional({ example: false, description: 'Azzera la quota di iscrizione di 30€' })
  @IsBoolean()
  @IsOptional()
  waive_registration_fee?: boolean;

  @ApiPropertyOptional({ example: 50, description: 'Numero massimo di utilizzi (null = illimitato)' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_uses?: number | null;

  @ApiPropertyOptional({ example: 1, description: 'Numero massimo di utilizzi per singolo utente (null = illimitato)' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_uses_per_user?: number | null;

  @ApiPropertyOptional({ example: ['123e4567-e89b-12d3-a456-426614174000'], description: 'Corsi a cui è applicabile (vuoto = tutti)' })
  @IsOptional()
  applicable_course_ids?: string[];

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z', description: 'Data di inizio validità' })
  @IsString()
  @IsOptional()
  valid_from?: string | null;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59Z', description: 'Data di fine validità' })
  @IsString()
  @IsOptional()
  valid_until?: string | null;

  @ApiPropertyOptional({ example: true, description: 'Stato attivo/disattivo' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({ example: 'ESTATE2026' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'Sconto estivo 15%' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  discount_type?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount_value?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  waive_registration_fee?: boolean;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_uses?: number | null;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_uses_per_user?: number | null;

  @ApiPropertyOptional({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @IsOptional()
  applicable_course_ids?: string[];

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z' })
  @IsString()
  @IsOptional()
  valid_from?: string | null;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59Z' })
  @IsString()
  @IsOptional()
  valid_until?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class ValidatePromoCodeDto {
  @ApiProperty({ example: 'ESTATE2026', description: 'Codice promozionale da validare' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID del corso' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ example: 120.0, description: 'Prezzo del corso in EUR' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  coursePrice?: number;

  @ApiPropertyOptional({ example: 30.0, description: 'Quota associativa in EUR' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  registrationFee?: number;

  @ApiPropertyOptional({ example: 'mario.rossi@email.com' })
  @IsString()
  @IsOptional()
  purchaserEmail?: string;

  @ApiPropertyOptional({ example: 'RSSMRA80A01H501Z' })
  @IsString()
  @IsOptional()
  purchaserTaxCode?: string;
}

export class ToggleAllPromoCodesDto {
  @ApiProperty({ example: true, description: 'True to activate all promo codes, false to deactivate all' })
  @IsBoolean()
  is_active: boolean;
}
