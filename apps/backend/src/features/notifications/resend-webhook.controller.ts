import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { handleResendWebhook } from '@atena/core';

@ApiTags('Public & Webhooks — Resend Email Events')
@Controller(['webhooks/resend', 'notifications/resend-webhook', 'landing/mail/webhook', 'mail/webhook'])
export class ResendWebhookController {
  private readonly logger = new Logger(ResendWebhookController.name);
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      '';

    this.supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Прием входящих вебхуков от Resend (доставка, открытия, клики, отскоки)',
    description: 'Обрабатывает события email.delivered, email.bounced, email.opened и синхронизирует статус в notification_logs',
  })
  @ApiResponse({ status: 200, description: 'Вебхук успешно обработан' })
  async handleWebhook(
    @Req() req: any,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    const rawBody = req.rawBody || req.body;
    const bodyPayload = typeof rawBody === 'string' || Buffer.isBuffer(rawBody)
      ? rawBody
      : JSON.stringify(rawBody);

    const result = await handleResendWebhook({
      supabase: this.supabase,
      rawBody: bodyPayload,
      headers,
    });

    if (!result.success) {
      this.logger.warn(`[RESEND WEBHOOK WARNING]: ${result.error}`);
      throw new BadRequestException(result.error || 'Webhook verification failed');
    }

    this.logger.log(`[RESEND WEBHOOK PROCESSED]: ${result.processed} event(s) handled`);
    return { received: true, processed: result.processed };
  }
}
