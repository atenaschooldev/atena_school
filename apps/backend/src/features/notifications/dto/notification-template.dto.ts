import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TemplateBlocksConfig } from '@atena/api-types';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional({ description: 'Название шаблона' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Описание назначения шаблона' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Тема письма' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Тема письма (алиас)' })
  @IsOptional()
  @IsString()
  subject_template?: string;

  @ApiPropertyOptional({ description: 'HTML верстка письма' })
  @IsOptional()
  @IsString()
  body_html?: string;

  @ApiPropertyOptional({ description: 'Текст письма / Telegram сообщения' })
  @IsOptional()
  @IsString()
  body_text?: string;

  @ApiPropertyOptional({ description: 'Тело сообщения (алиас)' })
  @IsOptional()
  @IsString()
  body_template?: string;

  @ApiPropertyOptional({ description: 'Визуальная конфигурация блоков' })
  @IsOptional()
  @IsObject()
  blocks_config?: TemplateBlocksConfig;

  @ApiPropertyOptional({ description: 'Активен ли шаблон' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class TestSendNotificationDto {
  @ApiProperty({ description: 'Получатель тестового сообщения (email или Telegram chat ID)' })
  @IsString()
  recipient: string;

  @ApiPropertyOptional({ description: 'Пользовательская тема письма для теста' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Пользовательская тема письма для теста' })
  @IsOptional()
  @IsString()
  subject_template?: string;

  @ApiPropertyOptional({ description: 'Пользовательский HTML для теста' })
  @IsOptional()
  @IsString()
  body_html?: string;

  @ApiPropertyOptional({ description: 'Пользовательский текст для теста' })
  @IsOptional()
  @IsString()
  body_text?: string;

  @ApiPropertyOptional({ description: 'Пользовательское тело письма/сообщения для теста' })
  @IsOptional()
  @IsString()
  body_template?: string;

  @ApiPropertyOptional({ description: 'Визуальная конфигурация блоков для теста' })
  @IsOptional()
  @IsObject()
  blocks_config?: TemplateBlocksConfig;

  @ApiPropertyOptional({ description: 'Тестовые значения для подстановки в шаблон' })
  @IsOptional()
  @IsObject()
  sample_data?: Record<string, any>;
}

