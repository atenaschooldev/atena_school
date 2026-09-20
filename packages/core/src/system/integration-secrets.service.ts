import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  IntegrationProvider,
  ResendCredentials,
  TelegramCredentials,
  StripeCredentials,
  AnalyticsCredentials,
  DomainsCredentials,
  IntegrationSecretRecord,
  MaskedIntegrationSecretRecord,
} from '@atena/api-types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const cache = new Map<string, CacheEntry<any>>();

let defaultAdminClient: SupabaseClient | null = null;

export function getDefaultSupabaseClient(): SupabaseClient | null {
  if (defaultAdminClient) return defaultAdminClient;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    defaultAdminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return defaultAdminClient;
  }
  return null;
}

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
  const client = supabase || getDefaultSupabaseClient();
  if (!client) return null;

  const cached = cache.get(provider);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  try {
    const { data, error } = await client
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
    chatIds: dbCreds?.chatIds || [],
    locale: (dbCreds?.locale || process.env.TELEGRAM_LOCALE || 'it') as 'it' | 'en' | 'ru',
    notifyBookings: dbCreds?.notifyBookings ?? true,
    notifyPayments: dbCreds?.notifyPayments ?? true,
    notifyCash: dbCreds?.notifyCash ?? true,
    notifyLeads: dbCreds?.notifyLeads ?? true,
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
 * Fetch Analytics credentials (GA4, GTM, Clarity, Meta Pixel) from DB with ENV fallback
 */
export async function getAnalyticsCredentials(
  supabase?: SupabaseClient | null
): Promise<AnalyticsCredentials> {
  const dbCreds = await getSecretFromDb<AnalyticsCredentials>(
    supabase,
    IntegrationProvider.ANALYTICS
  );

  return {
    gaId: dbCreds?.gaId || process.env.NEXT_PUBLIC_GA_ID || '',
    gtmId: dbCreds?.gtmId || process.env.NEXT_PUBLIC_GTM_ID || '',
    clarityId: dbCreds?.clarityId || process.env.NEXT_PUBLIC_CLARITY_ID || '',
    metaPixelId: dbCreds?.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  };
}

function isLocalhost(url?: string | null): boolean {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Fetch official domains and app URLs from DB with ENV fallback.
 * Strictly guarantees that local development runs on localhost ports.
 */
export async function getDomainsCredentials(
  supabase?: SupabaseClient | null
): Promise<DomainsCredentials> {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return {
      siteUrl: isLocalhost(process.env.NEXT_PUBLIC_SITE_URL)
        ? process.env.NEXT_PUBLIC_SITE_URL!
        : 'http://localhost:3000',
      appUrl: isLocalhost(process.env.NEXT_PUBLIC_APP_URL)
        ? process.env.NEXT_PUBLIC_APP_URL!
        : 'http://localhost:3002',
      adminUrl: isLocalhost(process.env.NEXT_PUBLIC_ADMIN_URL)
        ? process.env.NEXT_PUBLIC_ADMIN_URL!
        : 'http://localhost:3001',
    };
  }

  const dbCreds = await getSecretFromDb<DomainsCredentials>(
    supabase,
    IntegrationProvider.DOMAINS
  );

  return {
    siteUrl:
      dbCreds?.siteUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      'https://atenaschool.com',
    appUrl:
      dbCreds?.appUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      'https://app.atenaschool.com',
    adminUrl:
      dbCreds?.adminUrl ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      process.env.ADMIN_URL ||
      'https://atena-school-admin.vercel.app',
  };
}

/**
 * Returns masked representation of integration configs for Admin CRM UI
 */
export async function getMaskedIntegrationsSummary(
  supabase?: SupabaseClient | null
): Promise<Record<string, MaskedIntegrationSecretRecord>> {
  const client = supabase || getDefaultSupabaseClient();
  // Load raw from DB if available
  let dbRows: IntegrationSecretRecord[] = [];
  if (client) {
    try {
      const { data } = await client.from('integration_secrets').select('*');
      if (data) dbRows = data as IntegrationSecretRecord[];
    } catch (e) {
      console.warn('[IntegrationSecrets] Failed to fetch summary from DB:', e);
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

  // Analytics
  const analyticsDb = dbMap.get(IntegrationProvider.ANALYTICS);
  const analyticsActive = analyticsDb?.is_active ?? true;
  const analyticsRaw = analyticsDb?.credentials as Partial<AnalyticsCredentials> | undefined;
  const analyticsSource: 'database' | 'env' = (analyticsRaw?.gaId || analyticsRaw?.gtmId || analyticsRaw?.clarityId || analyticsRaw?.metaPixelId) ? 'database' : 'env';
  const analyticsCreds = await getAnalyticsCredentials(supabase);

  // Domains
  const domainsDb = dbMap.get(IntegrationProvider.DOMAINS);
  const domainsActive = domainsDb?.is_active ?? true;
  const domainsRaw = domainsDb?.credentials as Partial<DomainsCredentials> | undefined;
  const domainsSource: 'database' | 'env' = (domainsRaw?.siteUrl || domainsRaw?.appUrl || domainsRaw?.adminUrl) ? 'database' : 'env';
  const domainsCreds = await getDomainsCredentials(supabase);

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
        notifyBookings: tgCreds.notifyBookings,
        notifyPayments: tgCreds.notifyPayments,
        notifyCash: tgCreds.notifyCash,
        notifyLeads: tgCreds.notifyLeads,
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
    [IntegrationProvider.ANALYTICS]: {
      provider: IntegrationProvider.ANALYTICS,
      credentials: {
        gaId: analyticsCreds.gaId || '',
        gtmId: analyticsCreds.gtmId || '',
        clarityId: analyticsCreds.clarityId || '',
        metaPixelId: analyticsCreds.metaPixelId || '',
      },
      is_active: analyticsActive,
      is_configured: Boolean(analyticsCreds.gaId || analyticsCreds.gtmId || analyticsCreds.clarityId),
      source: analyticsSource,
      updated_at: analyticsDb?.updated_at || null,
    },
    [IntegrationProvider.DOMAINS]: {
      provider: IntegrationProvider.DOMAINS,
      credentials: {
        siteUrl: domainsCreds.siteUrl || '',
        appUrl: domainsCreds.appUrl || '',
        adminUrl: domainsCreds.adminUrl || '',
      },
      is_active: domainsActive,
      is_configured: Boolean(domainsCreds.siteUrl && domainsCreds.appUrl),
      source: domainsSource,
      updated_at: domainsDb?.updated_at || null,
    },
  };
}
