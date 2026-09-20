/**
 * ============================================================================
 * ATENA SCHOOL — INTEGRATION SECRETS & WHITE-LABEL PROVIDERS DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/integrations
 * @description
 * Конфигурация и учетные данные внешних провайдеров (integration_secrets table):
 * - Resend: transactional email сервис
 * - Telegram: бот уведомлений и интерактивных действий администратора
 * - Stripe: платежный шлюз (checkout, webhook, subscriptions)
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Integration Provider Enum & Dictionary
// ----------------------------------------------------------------------------

export const IntegrationProvider = {
  RESEND: 'resend',
  TELEGRAM: 'telegram',
  STRIPE: 'stripe',
  ANALYTICS: 'analytics',
} as const;
export type IntegrationProvider = (typeof IntegrationProvider)[keyof typeof IntegrationProvider];

export const INTEGRATION_PROVIDERS_DICTIONARY: Record<string, DictionaryEntry> = {
  [IntegrationProvider.RESEND]: {
    id: 1,
    code: IntegrationProvider.RESEND,
    label_it: 'Resend (Email transazionali)',
    label_en: 'Resend (Transactional Emails)',
    label_ru: 'Resend (Транзакционные email)',
    description: 'API-ключ и адреса отправителя/секретариата для рассылки квитанций и уведомлений',
  },
  [IntegrationProvider.TELEGRAM]: {
    id: 2,
    code: IntegrationProvider.TELEGRAM,
    label_it: 'Telegram Bot & Notifiche',
    label_en: 'Telegram Bot & Notifications',
    label_ru: 'Telegram Бот и уведомления',
    description: 'Токен бота и ID чата для оповещений администратора о новых записях и лидах',
  },
  [IntegrationProvider.STRIPE]: {
    id: 3,
    code: IntegrationProvider.STRIPE,
    label_it: 'Stripe Gateway di Pagamento',
    label_en: 'Stripe Payment Gateway',
    label_ru: 'Платежный шлюз Stripe',
    description: 'Secret key, Publishable key и Webhook secret для обработки платежей картами',
  },
  [IntegrationProvider.ANALYTICS]: {
    id: 4,
    code: IntegrationProvider.ANALYTICS,
    label_it: 'Web Analytics & Tracking',
    label_en: 'Web Analytics & Tracking',
    label_ru: 'Веб-аналитика и трекинг',
    description: 'ID для Google Analytics 4, Google Tag Manager, Microsoft Clarity и Meta Pixel',
  },
};

// ----------------------------------------------------------------------------
// 2. Provider Credentials Interfaces
// ----------------------------------------------------------------------------

export interface ResendCredentials {
  apiKey: string;
  fromEmail: string;
  adminEmail: string;
}

export interface TelegramCredentials {
  botToken: string;
  chatId: string;
  locale?: 'it' | 'en' | 'ru';
}

export interface StripeCredentials {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  isLive?: boolean;
}

export interface AnalyticsCredentials {
  gaId?: string;
  gtmId?: string;
  clarityId?: string;
  metaPixelId?: string;
}

export type AnyIntegrationCredentials =
  | ResendCredentials
  | TelegramCredentials
  | StripeCredentials
  | AnalyticsCredentials
  | Record<string, any>;

// ----------------------------------------------------------------------------
// 3. Database Entity & DTO Interfaces
// ----------------------------------------------------------------------------

export interface IntegrationSecretRecord<T = AnyIntegrationCredentials> {
  provider: IntegrationProvider | string;
  credentials: T;
  is_active: boolean;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface MaskedIntegrationSecretRecord {
  provider: IntegrationProvider | string;
  credentials: Record<string, string | boolean | undefined>;
  is_active: boolean;
  is_configured: boolean;
  source: 'database' | 'env';
  updated_at?: string | null;
}

export interface UpdateIntegrationSecretDto<T = AnyIntegrationCredentials> {
  credentials: Partial<T>;
  is_active?: boolean;
}

export interface SetTelegramWebhookDto {
  webhookUrl?: string;
}

export interface TestIntegrationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}
