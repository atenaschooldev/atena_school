import { NextRequest } from 'next/server';
import { createCustomerPortalSession } from '@/lib/server/checkout-service';
import { customerPortalSchema } from '@atena/validators';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/server/rate-limit';
import { apiError, apiSuccess } from '@/lib/server/api-response';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`customer-portal:${ip}`, { intervalMs: 60 * 1000, maxRequests: 20 });
  if (!rate.success) {
    return rateLimitExceededResponse(rate.retryAfter);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Malformed JSON payload', 400);
  }

  const parsed = customerPortalSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await createCustomerPortalSession(parsed.data);
    return apiSuccess(result, 200);
  } catch (err: unknown) {
    console.error('[customer-portal route error]:', err);
    const message = err instanceof Error ? err.message : 'Failed to create customer portal session';
    return apiError(message, 400);
  }
}
