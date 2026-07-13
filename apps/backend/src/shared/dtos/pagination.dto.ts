import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы (начиная с 1)',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на одной странице',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  get offset(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Количество элементов на странице' })
  limit: number;

  @ApiProperty({ description: 'Общее количество элементов' })
  total: number;

  @ApiProperty({ description: 'Общее количество страниц' })
  pages: number;

  static create(page: number, limit: number, total: number): PaginationMetaDto {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const totalNum = Number(total) || 0;
    return {
      page: pageNum,
      limit: limitNum,
      total: totalNum,
      pages: Math.ceil(totalNum / limitNum) || 1,
    };
  }
}

export class PaginatedResponseDto<T> {
  data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
