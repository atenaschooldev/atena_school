import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIntegrationDto {
  @ApiProperty({
    description: 'Учетные данные провайдера (ключи, токены, email)',
    example: { apiKey: 're_1234567890', fromEmail: 'info@atenaschool.com' },
  })
  credentials!: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Флаг активности интеграции',
    example: true,
  })
  is_active?: boolean;
}

export class TestIntegrationDto {
  @ApiPropertyOptional({
    description: 'Email для отправки тестового письма (для Resend)',
    example: 'admin@atenaschool.com',
  })
  toEmail?: string;

  @ApiPropertyOptional({
    description: 'Пользовательский текст для теста',
    example: 'Test integration message',
  })
  message?: string;
}

export class SetTelegramWebhookDto {
  @ApiPropertyOptional({
    description: 'Полный HTTPS URL эндпоинта вебхука бэкенда. Если не передан, вычисляется автоматически.',
    example: 'https://backend.atenaschool.com/checkout/webhook/telegram',
  })
  webhookUrl?: string;
}
