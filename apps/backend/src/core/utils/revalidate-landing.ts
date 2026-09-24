import { Logger } from '@nestjs/common';

const logger = new Logger('LandingRevalidation');

/**
 * Dispatches an on-demand revalidation request to the Next.js landing app.
 * Ensures any update made by the CRM (school profile, phone, brand name, courses, form templates, analytics)
 * is immediately reflected on the live landing page without waiting for ISR expiry.
 */
export async function revalidateLanding(options?: { path?: string; tag?: string }): Promise<boolean> {
  const landingUrl =
    process.env.LANDING_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';

  const revalidationSecret =
    process.env.REVALIDATION_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    'atena-revalidation-secret';

  try {
    const endpoint = `${landingUrl.replace(/\/$/, '')}/landing/revalidate`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

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

    if (!response.ok) {
      logger.warn(`Landing revalidation failed with status ${response.status}: ${await response.text().catch(() => '')}`);
      return false;
    }

    logger.log(`Landing revalidated successfully (path: ${options?.path || 'all'}, tag: ${options?.tag || 'all'})`);
    return true;
  } catch (err: any) {
    logger.warn(`Could not reach landing for revalidation: ${err?.message || err}`);
    return false;
  }
}
