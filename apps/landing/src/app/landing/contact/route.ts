import { NextRequest, NextResponse } from 'next/server';
import { submitContact } from '@/lib/server/checkout-service';
import { contactFormSchema } from '@atena/validators';
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from '@/lib/server/rate-limit';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export const POST = withLandingApiLog(
  async (request: NextRequest) => {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact:${ip}`, { intervalMs: 60 * 1000, maxRequests: 5 });
    if (!rate.success) {
      return rateLimitExceededResponse(rate.retryAfter);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    try {
      const result = await submitContact(parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to submit contact message' },
        { status: 400 }
      );
    }
  },
  { controller: 'ContactLandingController', action: 'submitContactMessage' },
);

