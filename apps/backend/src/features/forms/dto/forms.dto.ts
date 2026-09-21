import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';
import { FormType, FormFieldConfig } from '@atena/api-types';

export class CreateFormTemplateDto {
  @ApiProperty({ description: 'Название шаблона формы' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Описание формы' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FormType, description: 'Тип формы' })
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
  @IsString()
  category_slug?: string | null;

  @ApiPropertyOptional({ description: 'Привязка к конкретному курсу' })
  @IsOptional()
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
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: FormType, description: 'Тип формы' })
  @IsOptional()
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
  @IsString()
  category_slug?: string | null;

  @ApiPropertyOptional({ description: 'Привязка к конкретному курсу' })
  @IsOptional()
  @IsString()
  course_id?: string | null;

  @ApiPropertyOptional({ description: 'Конфигурация полей формы', type: 'array' })
  @IsOptional()
  @IsArray()
  fields_config?: FormFieldConfig[];
}

export class ResolveFormQueryDto {
  @ApiProperty({ enum: FormType, description: 'Тип формы' })
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
