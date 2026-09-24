import { Logger } from '@nestjs/common';

const logger = new Logger('LandingRevalidation');

/**
 * Dispatches on-demand revalidation requests to the Next.js landing app.
 * Automatically targets all relevant URLs (localhost:3000, configured SITE_URL, production)
 * so that updates from local CRM or production CRM instantly purge stale cache.
 */
export async function revalidateLanding(options?: { path?: string; tag?: string }): Promise<boolean> {
  const candidateUrls = new Set<string>();

  if (process.env.LANDING_URL) candidateUrls.add(process.env.LANDING_URL);
  if (process.env.NEXT_PUBLIC_SITE_URL) candidateUrls.add(process.env.NEXT_PUBLIC_SITE_URL);
  if (process.env.SITE_URL) candidateUrls.add(process.env.SITE_URL);

  // In local development or testing, always include localhost landing
  candidateUrls.add('http://localhost:3000');
  candidateUrls.add('http://127.0.0.1:3000');

  // Also include production domain if not already present
  candidateUrls.add('https://atenaschool.com');

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
