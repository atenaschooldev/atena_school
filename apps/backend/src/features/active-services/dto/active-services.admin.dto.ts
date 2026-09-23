import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BillingScheme } from '@atena/api-types';

export class QueryActiveServicesDto {
  @ApiPropertyOptional({ description: 'Search query across student name, email, tax code or course name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filter by course category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by billing scheme (1=FULL, 2=SUBSCRIPTION, 3=INSTALLMENTS)', enum: BillingScheme })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  billingScheme?: number;

  @ApiPropertyOptional({ description: 'Filter by student annual fee paid status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  studentAnnualFeePaid?: boolean;

  @ApiPropertyOptional({ description: 'Limit number of results', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;
}
