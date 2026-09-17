import { NextRequest } from 'next/server';
import { createReservation } from '@/lib/server/checkout-service';
import { createReservationSchema } from '@atena/validators';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/server/rate-limit';
import { apiError, apiSuccess } from '@/lib/server/api-response';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`reserve:${ip}`, { intervalMs: 60 * 1000, maxRequests: 15 });
  if (!rate.success) {
    return rateLimitExceededResponse(rate.retryAfter);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Malformed JSON payload', 400);
  }

  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('Validation failed', 422, parsed.error.flatten().fieldErrors);
  }

  try {
    const result = await createReservation(parsed.data);
    return apiSuccess(result, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create reservation';
    return apiError(message, 400);
  }
}
