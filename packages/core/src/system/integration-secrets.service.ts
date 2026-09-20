import type { SupabaseClient } from '@supabase/supabase-js';
import {
  IntegrationProvider,
  ResendCredentials,
  TelegramCredentials,
  StripeCredentials,
  IntegrationSecretRecord,
  MaskedIntegrationSecretRecord,
} from '@atena/api-types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const cache = new Map<string, CacheEntry<any>>();

export function clearSecretsCache(provider?: string): void {
  if (provider) {
    cache.delete(provider);
  } else {
    cache.clear();
  }
}

/**
 * Mask secret string for safe display in UI/API responses
 * e.g. "re_1234567890abcdef" -> "re_1234••••cdef"
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '';
  const str = String(secret).trim();
  if (str.length <= 8) {
    return '••••••••';
  }
  const prefix = str.slice(0, 4);
  const suffix = str.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * Generic helper to fetch secret credentials from DB with memory cache
 */
async function getSecretFromDb<T>(
  supabase: SupabaseClient | null | undefined,
  provider: string
): Promise<T | null> {
  if (!supabase) return null;

  const cached = cache.get(provider);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  try {
    const { data, error } = await supabase
      .from('integration_secrets')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data || !data.credentials) {
      return null;
    }

    const creds = data.credentials as T;
    cache.set(provider, { data: creds, expiresAt: now + CACHE_TTL_MS });
    return creds;
  } catch (err) {
    console.warn(`[IntegrationSecrets] Failed to load secrets for ${provider} from DB:`, err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// Provider Specific Loaders with .env Fallback
// ----------------------------------------------------------------------------

export async function getResendCredentials(
  supabase?: SupabaseClient | null
): Promise<ResendCredentials> {
  const dbCreds = await getSecretFromDb<Partial<ResendCredentials>>(supabase, IntegrationProvider.RESEND);

  return {
    apiKey: dbCreds?.apiKey || process.env.RESEND_API_KEY || '',
    fromEmail:
      dbCreds?.fromEmail ||
      process.env.RESEND_FROM_EMAIL ||
      'Atena School <info@atenaschool.com>',
    adminEmail:
      dbCreds?.adminEmail ||
      process.env.SCHOOL_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      'atenaschool20@gmail.com',
  };
}

export async function getTelegramCredentials(
  supabase?: SupabaseClient | null
): Promise<TelegramCredentials> {
  const dbCreds = await getSecretFromDb<Partial<TelegramCredentials>>(supabase, IntegrationProvider.TELEGRAM);

  return {
    botToken: dbCreds?.botToken || process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: dbCreds?.chatId || process.env.TELEGRAM_CHAT_ID || '',
    locale: (dbCreds?.locale || process.env.TELEGRAM_LOCALE || 'it') as 'it' | 'en' | 'ru',
  };
}

export async function getStripeCredentials(
  supabase?: SupabaseClient | null
): Promise<StripeCredentials> {
  const dbCreds = await getSecretFromDb<Partial<StripeCredentials>>(supabase, IntegrationProvider.STRIPE);

  return {
    secretKey: dbCreds?.secretKey || process.env.STRIPE_SECRET_KEY || '',
    publishableKey:
      dbCreds?.publishableKey ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      '',
    webhookSecret: dbCreds?.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '',
    isLive:
      typeof dbCreds?.isLive === 'boolean'
        ? dbCreds.isLive
        : process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false,
  };
}

/**
 * Returns masked representation of integration configs for Admin CRM UI
 */
export async function getMaskedIntegrationsSummary(
  supabase?: SupabaseClient | null
): Promise<Record<string, MaskedIntegrationSecretRecord>> {
  // Load raw from DB if available
  let dbRows: IntegrationSecretRecord[] = [];
  if (supabase) {
    try {
      const { data } = await supabase.from('integration_secrets').select('*');
      if (data) dbRows = data as IntegrationSecretRecord[];
    } catch (e) {
      console.warn('[IntegrationSecrets] Failed to list secrets for admin:', e);
    }
  }

  const dbMap = new Map<string, IntegrationSecretRecord>(
    dbRows.map((r) => [r.provider, r])
  );

  // Resend
  const resendDb = dbMap.get(IntegrationProvider.RESEND);
  const resendActive = resendDb?.is_active ?? true;
  const resendRaw = resendDb?.credentials as Partial<ResendCredentials> | undefined;
  const resendSource: 'database' | 'env' = resendRaw?.apiKey ? 'database' : 'env';
  const resendCreds = await getResendCredentials(supabase);

  // Telegram
  const tgDb = dbMap.get(IntegrationProvider.TELEGRAM);
  const tgActive = tgDb?.is_active ?? true;
  const tgRaw = tgDb?.credentials as Partial<TelegramCredentials> | undefined;
  const tgSource: 'database' | 'env' = tgRaw?.botToken ? 'database' : 'env';
  const tgCreds = await getTelegramCredentials(supabase);

  // Stripe
  const stripeDb = dbMap.get(IntegrationProvider.STRIPE);
  const stripeActive = stripeDb?.is_active ?? true;
  const stripeRaw = stripeDb?.credentials as Partial<StripeCredentials> | undefined;
  const stripeSource: 'database' | 'env' = stripeRaw?.secretKey ? 'database' : 'env';
  const stripeCreds = await getStripeCredentials(supabase);

  return {
    [IntegrationProvider.RESEND]: {
      provider: IntegrationProvider.RESEND,
      credentials: {
        apiKey: maskSecret(resendCreds.apiKey),
        fromEmail: resendCreds.fromEmail,
        adminEmail: resendCreds.adminEmail,
      },
      is_active: resendActive,
      is_configured: Boolean(resendCreds.apiKey),
      source: resendSource,
      updated_at: resendDb?.updated_at || null,
    },
    [IntegrationProvider.TELEGRAM]: {
      provider: IntegrationProvider.TELEGRAM,
      credentials: {
        botToken: maskSecret(tgCreds.botToken),
        chatId: tgCreds.chatId || '',
        locale: tgCreds.locale,
      },
      is_active: tgActive,
      is_configured: Boolean(tgCreds.botToken && tgCreds.chatId),
      source: tgSource,
      updated_at: tgDb?.updated_at || null,
    },
    [IntegrationProvider.STRIPE]: {
      provider: IntegrationProvider.STRIPE,
      credentials: {
        secretKey: maskSecret(stripeCreds.secretKey),
        publishableKey: stripeCreds.publishableKey ? `${stripeCreds.publishableKey.slice(0, 12)}••••` : '',
        webhookSecret: maskSecret(stripeCreds.webhookSecret),
        isLive: stripeCreds.isLive,
      },
      is_active: stripeActive,
      is_configured: Boolean(stripeCreds.secretKey),
      source: stripeSource,
      updated_at: stripeDb?.updated_at || null,
    },
  };
}
