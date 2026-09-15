import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { StudentStatus, LanguageLevel } from '@atena/api-types';

export class UpdateStudentRequestDto {
  @ApiPropertyOptional({ description: 'Полное имя студента' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Имя' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Фамилия' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Телефон' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Codice Fiscale (налоговый код)' })
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ description: 'Дата рождения (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Уровень владения языком CEFR: 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2',
    enum: LanguageLevel,
    example: LanguageLevel.A1,
  })
  @IsOptional()
  languageLevel?: LanguageLevel | number | string;

  @ApiPropertyOptional({
    description: 'Статус студента: 1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED',
    enum: StudentStatus,
    example: StudentStatus.ACTIVE,
  })
  @IsOptional()
  status?: StudentStatus | number | string;

  @ApiPropertyOptional({ description: 'Оплачен ли ежегодный взнос €30' })
  @IsOptional()
  @IsBoolean()
  annualFeePaid?: boolean;

  @ApiPropertyOptional({ description: 'Заметки' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'SDI код для фактуры' })
  @IsOptional()
  @IsString()
  sdiCode?: string;

  @ApiPropertyOptional({ description: 'PEC Email для фактуры' })
  @IsOptional()
  @IsString()
  pecEmail?: string;
}
