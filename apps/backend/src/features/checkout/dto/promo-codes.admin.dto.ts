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
