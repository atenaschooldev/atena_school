import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { FormType, FormFieldConfig, parseFormType } from '@atena/api-types';

export class CreateFormTemplateDto {
  @ApiProperty({ description: 'Название шаблона формы' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Описание формы' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  description?: string | null;

  @ApiProperty({ enum: FormType, description: 'Тип формы' })
  @Transform(({ value }) => parseFormType(value))
  @IsIn([FormType.BOOKING, FormType.CONTACT, FormType.TEST, FormType.CUSTOM])
  form_type: FormType;

  @ApiPropertyOptional({ description: 'Сделать ли дефолтной' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Активна ли форма' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Привязка к категории курсов' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  category_slug?: string | null;

  @ApiPropertyOptional({ description: 'Привязка к конкретному курсу' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  course_id?: string | null;

  @ApiProperty({ description: 'Конфигурация полей формы', type: 'array' })
  @IsArray()
  fields_config: FormFieldConfig[];
}

export class UpdateFormTemplateDto {
  @ApiPropertyOptional({ description: 'Название шаблона формы' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Описание формы' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ enum: FormType, description: 'Тип формы' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFormType(value) : undefined))
  @IsIn([FormType.BOOKING, FormType.CONTACT, FormType.TEST, FormType.CUSTOM])
  form_type?: FormType;

  @ApiPropertyOptional({ description: 'Сделать ли дефолтной' })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Активна ли форма' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Привязка к категории курсов' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  category_slug?: string | null;

  @ApiPropertyOptional({ description: 'Привязка к конкретному курсу' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  course_id?: string | null;

  @ApiPropertyOptional({ description: 'Конфигурация полей формы', type: 'array' })
  @IsOptional()
  @IsArray()
  fields_config?: FormFieldConfig[];
}

export class ResolveFormQueryDto {
  @ApiProperty({ enum: FormType, description: 'Тип формы' })
  @Transform(({ value }) => parseFormType(value))
  @IsIn([FormType.BOOKING, FormType.CONTACT, FormType.TEST, FormType.CUSTOM])
  form_type: FormType;

  @ApiPropertyOptional({ description: 'ID курса' })
  @IsOptional()
  @IsString()
  course_id?: string;

  @ApiPropertyOptional({ description: 'Слаг категории' })
  @IsOptional()
  @IsString()
  category_slug?: string;
}

export class CreateFormFieldDto {
  @ApiProperty({ description: 'Системный уникальный ключ латиницей' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Название поля на итальянском' })
  @IsString()
  label_it: string;

  @ApiProperty({ description: 'Название поля на английском' })
  @IsString()
  label_en: string;

  @ApiPropertyOptional({ description: 'Плейсхолдер на итальянском' })
  @IsOptional()
  @IsString()
  placeholder_it?: string;

  @ApiPropertyOptional({ description: 'Плейсхолдер на английском' })
  @IsOptional()
  @IsString()
  placeholder_en?: string;

  @ApiProperty({ description: 'Тип поля' })
  @IsString()
  field_type: string;

  @ApiPropertyOptional({ description: 'Целевой объект (purchaser, student, booking, contact)' })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiPropertyOptional({ description: 'Массив целевых объектов', type: [String] })
  @IsOptional()
  @IsArray()
  targets?: string[];

  @ApiPropertyOptional({ description: 'Опции для селекта / радио' })
  @IsOptional()
  @IsArray()
  options?: any[];

  @ApiPropertyOptional({ description: 'Системное ли поле' })
  @IsOptional()
  @IsBoolean()
  is_system?: boolean;

  @ApiPropertyOptional({ description: 'Обязательное по умолчанию' })
  @IsOptional()
  @IsBoolean()
  is_required_default?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки' })
  @IsOptional()
  sort_order?: number;
}

export class UpdateFormFieldDto {
  @ApiPropertyOptional({ description: 'Название поля на итальянском' })
  @IsOptional()
  @IsString()
  label_it?: string;

  @ApiPropertyOptional({ description: 'Название поля на английском' })
  @IsOptional()
  @IsString()
  label_en?: string;

  @ApiPropertyOptional({ description: 'Плейсхолдер на итальянском' })
  @IsOptional()
  @IsString()
  placeholder_it?: string;

  @ApiPropertyOptional({ description: 'Плейсхолдер на английском' })
  @IsOptional()
  @IsString()
  placeholder_en?: string;

  @ApiPropertyOptional({ description: 'Тип поля' })
  @IsOptional()
  @IsString()
  field_type?: string;

  @ApiPropertyOptional({ description: 'Целевой объект' })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiPropertyOptional({ description: 'Массив целевых объектов', type: [String] })
  @IsOptional()
  @IsArray()
  targets?: string[];

  @ApiPropertyOptional({ description: 'Опции для селекта / радио' })
  @IsOptional()
  @IsArray()
  options?: any[];

  @ApiPropertyOptional({ description: 'Обязательное по умолчанию' })
  @IsOptional()
  @IsBoolean()
  is_required_default?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки' })
  @IsOptional()
  sort_order?: number;
}

