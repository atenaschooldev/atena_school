import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsDefined, IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateIntegrationDto {
  @ApiProperty({
    description: 'Учетные данные провайдера (ключи, токены, email)',
    example: { apiKey: 're_1234567890', fromEmail: 'info@atenaschool.com' },
  })
  @IsObject()
  @IsDefined()
  credentials!: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Флаг активности интеграции',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class TestIntegrationDto {
  @ApiPropertyOptional({
    description: 'Email для отправки тестового письма (для Resend)',
    example: 'admin@atenaschool.com',
  })
  @IsString()
  @IsOptional()
  toEmail?: string;

  @ApiPropertyOptional({
    description: 'Пользовательский текст для теста',
    example: 'Test integration message',
  })
  @IsString()
  @IsOptional()
  message?: string;
}

export class SetTelegramWebhookDto {
  @ApiPropertyOptional({
    description: 'Полный HTTPS URL эндпоинта вебхука бэкенда/лендинга. Если не передан, вычисляется автоматически.',
    example: 'https://atenaschool.com/landing/telegram/webhook',
  })
  @IsString()
  @IsOptional()
  webhookUrl?: string;
}
