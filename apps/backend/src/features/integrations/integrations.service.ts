import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IntegrationProvider,
  MaskedIntegrationSecretRecord,
  TestIntegrationResult,
} from '@atena/api-types';
import {
  getMaskedIntegrationsSummary,
  getResendCredentials,
  getTelegramCredentials,
  getStripeCredentials,
  getAnalyticsCredentials,
  getDomainsCredentials,
  getSentryCredentials,
  revealIntegrationCredentials,
  clearSecretsCache,
  sendEmailViaResend,
  sendTelegramMessage,
  getStripeClient,
  encryptSecret,
  decryptSecret,
  captureExceptionToSentry,
} from '@atena/core';
import {
  UpdateIntegrationDto,
  TestIntegrationDto,
  SetTelegramWebhookDto,
} from './dto/integration.dto';
import { revalidateLanding } from '../../core/utils/revalidate-landing';

const SENSITIVE_FIELDS: Record<string, string[]> = {
  [IntegrationProvider.RESEND]: ['apiKey', 'webhookSecret'],
  [IntegrationProvider.TELEGRAM]: ['botToken'],
  [IntegrationProvider.STRIPE]: ['secretKey', 'webhookSecret'],
  [IntegrationProvider.SENTRY]: ['dsn'],
};

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
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

    if (!supabaseUrl || !serviceKey) {
      this.logger.warn('Supabase credentials missing for IntegrationsService');
    }
    this.supabase = createClient(supabaseUrl, serviceKey);
  }

  async getAllIntegrations(): Promise<Record<string, MaskedIntegrationSecretRecord>> {
    return getMaskedIntegrationsSummary(this.supabase);
  }

  async revealIntegration(provider: string): Promise<Record<string, any>> {
    const validProviders = [
      IntegrationProvider.RESEND,
      IntegrationProvider.TELEGRAM,
      IntegrationProvider.STRIPE,
      IntegrationProvider.ANALYTICS,
      IntegrationProvider.DOMAINS,
      IntegrationProvider.SENTRY,
    ];

    if (!validProviders.includes(provider as any)) {
      throw new BadRequestException(`Provider non valido: ${provider}`);
    }

    return revealIntegrationCredentials(provider, this.supabase);
  }

  async updateIntegration(
    provider: string,
    dto: UpdateIntegrationDto,
    userId?: string
  ): Promise<MaskedIntegrationSecretRecord> {
    const validProviders = [
      IntegrationProvider.RESEND,
      IntegrationProvider.TELEGRAM,
      IntegrationProvider.STRIPE,
      IntegrationProvider.ANALYTICS,
      IntegrationProvider.DOMAINS,
      IntegrationProvider.SENTRY,
    ];

    if (!validProviders.includes(provider as any)) {
      throw new BadRequestException(`Provider non valido: ${provider}`);
    }

    // Load current existing record if any
    const { data: existing } = await this.supabase
      .from('integration_secrets')
      .select('*')
      .eq('provider', provider)
      .maybeSingle();

    const existingCreds = (existing?.credentials as Record<string, any>) || {};

    // Merge credentials: if new value is empty string, unchanged, or masked (contains ••••), retain existing value
    const mergedCreds: Record<string, any> = { ...existingCreds };
    const sensitiveKeys = SENSITIVE_FIELDS[provider] || [];

    for (const [key, val] of Object.entries(dto.credentials || {})) {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.includes('••••')) {
          // Keep existing value
          continue;
        }
        if (trimmed !== '') {
          // Encrypt sensitive fields with AES-256-GCM before writing to database
          if (sensitiveKeys.includes(key)) {
            mergedCreds[key] = encryptSecret(trimmed);
          } else {
            mergedCreds[key] = trimmed;
          }
        }
      } else if (val !== undefined && val !== null) {
        mergedCreds[key] = val;
      }
    }

    const isActive = dto.is_active !== undefined ? dto.is_active : (existing?.is_active ?? true);

    const { error } = await this.supabase
      .from('integration_secrets')
      .upsert({
        provider,
        credentials: mergedCreds,
        is_active: isActive,
        updated_at: new Date().toISOString(),
        updated_by: userId || null,
      }, { onConflict: 'provider' });

    if (error) {
      this.logger.error(`Failed to update ${provider} secrets: ${error.message}`);
      throw new BadRequestException(`Salvataggio fallito: ${error.message}`);
    }

    // Invalidate memory cache so next call picks up the new credentials immediately
    clearSecretsCache(provider);
    revalidateLanding({ tag: provider }).catch(() => {});

    const all = await getMaskedIntegrationsSummary(this.supabase);
    return all[provider];
  }

  async setTelegramWebhook(dto: SetTelegramWebhookDto): Promise<TestIntegrationResult> {
    const tgCreds = await getTelegramCredentials(this.supabase);
    if (!tgCreds.botToken) {
      throw new BadRequestException('Telegram Bot Token non configurato.');
    }

    let webhookUrl = dto.webhookUrl;
    if (!webhookUrl) {
      const siteUrl =
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://atenaschool.com';
      webhookUrl = `${siteUrl.replace(/\/$/, '')}/landing/telegram/webhook`;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${tgCreds.botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['callback_query', 'message'],
          drop_pending_updates: false,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.ok) {
        return {
          success: false,
          message: data.description || 'Errore durante la registrazione del webhook su Telegram',
          details: data,
        };
      }

      return {
        success: true,
        message: `Webhook Telegram registrato con successo su: ${webhookUrl}`,
        details: data,
      };
    } catch (err: any) {
      this.logger.error('Telegram setWebhook error:', err);
      return {
        success: false,
        message: err.message || 'Errore di connessione a Telegram API',
      };
    }
  }

  async testIntegration(
    provider: string,
    dto: TestIntegrationDto
  ): Promise<TestIntegrationResult> {
    if (provider === IntegrationProvider.RESEND) {
      const resendCreds = await getResendCredentials(this.supabase);
      if (!resendCreds.apiKey) {
        throw new BadRequestException('Chiave API Resend non configurata.');
      }

      const targetEmail = dto.toEmail || resendCreds.adminEmail;
      if (!targetEmail) {
        throw new BadRequestException('Indirizzo email di destinazione mancante.');
      }

      const res = await sendEmailViaResend({
        apiKey: resendCreds.apiKey,
        from: resendCreds.fromEmail,
        to: targetEmail,
        subject: '🧪 Test Integrazione Resend — Atena School',
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1e293b;">
            <h2 style="color: #059669;">✅ Connessione Resend Riuscita!</h2>
            <p>Questa è una email di test inviata dal pannello di controllo Atena School CRM.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 13px; color: #64748b;">
              Mittente: <code>${resendCreds.fromEmail}</code><br/>
              Destinatario: <code>${targetEmail}</code><br/>
              Timestamp: <code>${new Date().toISOString()}</code>
            </p>
          </div>
        `,
      });

      if (!res.success) {
        return {
          success: false,
          message: res.error || 'Invio email di test fallito',
        };
      }

      return {
        success: true,
        message: `Email di test inviata con successo a ${targetEmail} (ID: ${res.messageId})`,
      };
    }

    if (provider === IntegrationProvider.TELEGRAM) {
      const tgCreds = await getTelegramCredentials(this.supabase);
      if (!tgCreds.botToken || !tgCreds.chatId) {
        throw new BadRequestException('Telegram Bot Token o Chat ID non configurati.');
      }

      const res = await sendTelegramMessage({
        supabase: this.supabase,
        botToken: tgCreds.botToken,
        chatId: tgCreds.chatId,
        text: `🧪 <b>TEST INTEGRAZIONE TELEGRAM</b>\n\n✅ Connessione riuscita dal pannello di controllo Atena CRM!\n\n⏰ <i>${new Date().toLocaleString('it-IT')}</i>`,
      });

      if (!res.success) {
        return {
          success: false,
          message: res.error || 'Invio messaggio Telegram fallito',
        };
      }

      return {
        success: true,
        message: `Messaggio di test inviato con successo alla chat ${tgCreds.chatId}`,
      };
    }

    if (provider === IntegrationProvider.STRIPE) {
      const stripeCreds = await getStripeCredentials(this.supabase);
      if (!stripeCreds.secretKey) {
        throw new BadRequestException('Stripe Secret Key non configurata.');
      }

      try {
        const stripe = getStripeClient(stripeCreds.secretKey);
        const balance = await stripe.balance.retrieve();
        const availableEur = balance.available.find((b) => b.currency === 'eur')?.amount || 0;

        return {
          success: true,
          message: `Connessione a Stripe API riuscita! Saldo disponibile: €${(availableEur / 100).toFixed(2)}`,
          details: {
            livemode: balance.livemode,
            available: balance.available,
          },
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Verifica credenziali Stripe fallita',
        };
      }
    }

    if (provider === IntegrationProvider.ANALYTICS) {
      const creds = await getAnalyticsCredentials(this.supabase);
      const configured: string[] = [];
      if (creds.gaId) configured.push(`GA4 (${creds.gaId})`);
      if (creds.gtmId) configured.push(`GTM (${creds.gtmId})`);
      if (creds.clarityId) configured.push(`Clarity (${creds.clarityId})`);
      if (creds.metaPixelId) configured.push(`Meta Pixel (${creds.metaPixelId})`);

      if (configured.length === 0) {
        throw new BadRequestException('Nessun tag di analisi configurato.');
      }

      return {
        success: true,
        message: `Configurazione Analytics valida: ${configured.join(', ')}`,
        details: creds,
      };
    }

    if (provider === IntegrationProvider.DOMAINS) {
      const creds = await getDomainsCredentials(this.supabase);
      const errors: string[] = [];

      const validateUrl = (label: string, urlStr?: string) => {
        if (!urlStr) {
          errors.push(`${label}: mancante`);
          return;
        }
        try {
          const parsed = new URL(urlStr);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            errors.push(`${label}: il protocollo deve essere http:// o https://`);
          }
        } catch {
          errors.push(`${label}: URL '${urlStr}' non è valido`);
        }
      };

      validateUrl('Sito Web (siteUrl)', creds.siteUrl);
      validateUrl('Portale Studenti (appUrl)', creds.appUrl);
      if (creds.adminUrl) {
        validateUrl('Portale CRM Admin (adminUrl)', creds.adminUrl);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: 'Errori di validazione URL domini',
          details: { errors },
        };
      }

      return {
        success: true,
        message: `Domini e URL configurati e validi: Sito (${creds.siteUrl}), Portale (${creds.appUrl}), CRM (${creds.adminUrl || 'default'})`,
        details: creds,
      };
    }

    if (provider === IntegrationProvider.SENTRY) {
      clearSecretsCache(IntegrationProvider.SENTRY);
      const creds = await getSentryCredentials(this.supabase);
      let dsn = (dto as any).dsn || creds.dsn;
      if (dsn?.startsWith('enc:v1:')) {
        dsn = decryptSecret(dsn);
      }
      if (!dsn || dsn.includes('••••')) {
        const { data: dbRow } = await this.supabase
          .from('integration_secrets')
          .select('credentials')
          .eq('provider', 'sentry')
          .maybeSingle();
        const rawFromDb = dbRow?.credentials?.dsn;
        if (rawFromDb) {
          dsn = rawFromDb.startsWith('enc:v1:') ? decryptSecret(rawFromDb) : rawFromDb;
        }
      }

      if (!dsn) {
        throw new BadRequestException('Sentry DSN non configurato.');
      }

      try {
        const url = new URL(dsn);
        if (!['http:', 'https:'].includes(url.protocol) || !url.username) {
          return {
            success: false,
            message: 'Formato Sentry DSN non valido (manca public key o host)',
          };
        }

        const eventId = await captureExceptionToSentry(
          new Error('Atena CRM Test Verification Event'),
          { instance: 'crm-admin-test-button', tags: { source: 'admin-test' } },
          { dsn, supabase: this.supabase }
        );

        return {
          success: true,
          message: `Sentry DSN verificato e connesso! Progetto: ${url.pathname.replace('/', '')} (${url.host})`,
          details: {
            host: url.host,
            project: url.pathname.replace('/', ''),
            testEventId: eventId || 'sent',
          },
        };
      } catch (e: any) {
        return {
          success: false,
          message: `DSN non valido: ${e.message}`,
        };
      }
    }

    throw new BadRequestException(`Test non supportato per provider: ${provider}`);
  }
}
