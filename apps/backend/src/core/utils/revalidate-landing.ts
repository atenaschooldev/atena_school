import { Logger } from '@nestjs/common';

const logger = new Logger('LandingRevalidation');

/**
 * Dispatches on-demand revalidation requests to the Next.js landing app.
 * Automatically targets all relevant URLs (localhost:3000, configured SITE_URL, production)
 * so that updates from local CRM or production CRM instantly purge stale cache.
 */
export async function revalidateLanding(options?: { path?: string; tag?: string }): Promise<boolean> {
  const candidateUrls = new Set<string>();

  // Explicitly configured target URLs via environment variables (12-factor / white-label ready)
  if (process.env.LANDING_URL) candidateUrls.add(process.env.LANDING_URL);
  if (process.env.SITE_URL) candidateUrls.add(process.env.SITE_URL);
  if (process.env.NEXT_PUBLIC_SITE_URL) candidateUrls.add(process.env.NEXT_PUBLIC_SITE_URL);

  // In local development or testing, fallback to localhost
  if (process.env.NODE_ENV !== 'production') {
    candidateUrls.add('http://localhost:3000');
    candidateUrls.add('http://127.0.0.1:3000');
  }

  // Safety Guard: NEVER trigger production landing revalidations when running with DEV database!
  // All edits in DEV database (Render, staging, local dev) must never consume Vercel ISR quotas.
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const databaseUrl = process.env.DATABASE_URL || '';
  const isDevDatabase =
    supabaseUrl.includes('hcxpfzsmzusolvhtuhhm') ||
    databaseUrl.includes('hcxpfzsmzusolvhtuhhm') ||
    process.env.APP_ENV === 'development';

  if (isDevDatabase) {
    for (const url of Array.from(candidateUrls)) {
      if (url.includes('atenaschool.com') || url.includes('.vercel.app')) {
        logger.debug(
          `[Revalidation Blocked] Stripped production target "${url}" because backend is connected to DEV database.`,
        );
        candidateUrls.delete(url);
      }
    }
  }

  if (candidateUrls.size === 0) {
    logger.debug('[Revalidation Skipped] No eligible revalidation target URLs after environment filtering.');
    return false;
  }

  const revalidationSecret =
    process.env.REVALIDATION_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    'atena-revalidation-secret';

  const results = await Promise.allSettled(
    Array.from(candidateUrls).map(async (baseUrl) => {
      const endpoint = `${baseUrl.replace(/\/$/, '')}/landing/revalidate`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidation-secret': revalidationSecret,
          },
          body: JSON.stringify({
            path: options?.path,
            tag: options?.tag,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (response.ok) {
          logger.log(`[Revalidation OK] ${endpoint} (tag: ${options?.tag || 'all'})`);
          return true;
        }
        return false;
      } catch (e: any) {
        clearTimeout(timeoutId);
        // Silently skip if instance is offline/unreachable
        return false;
      }
    })
  );

  return results.some((r) => r.status === 'fulfilled' && r.value === true);
}
