import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional({ description: 'Название шаблона' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Описание назначения шаблона' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Тема письма (для Email шаблонов)' })
  @IsOptional()
  @IsString()
  subject_template?: string;

  @ApiPropertyOptional({ description: 'Тело сообщения (HTML или текст с переменными {{var}})' })
  @IsOptional()
  @IsString()
  body_template?: string;

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
  subject_template?: string;

  @ApiPropertyOptional({ description: 'Пользовательское тело письма/сообщения для теста' })
  @IsOptional()
  @IsString()
  body_template?: string;

  @ApiPropertyOptional({ description: 'Тестовые значения для подстановки в шаблон' })
  @IsOptional()
  @IsObject()
  sample_data?: Record<string, any>;
}
