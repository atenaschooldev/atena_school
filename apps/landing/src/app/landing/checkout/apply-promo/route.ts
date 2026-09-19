import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@atena/core';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { applyPromoCodeSchema } from '@atena/validators';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export const POST = withLandingApiLog(
  async (request: NextRequest) => {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`apply-promo:${ip}`, { intervalMs: 60 * 1000, maxRequests: 30 });
    if (!rate.success) {
      return NextResponse.json(
        { valid: false, error: 'Too many requests. Please try again in a minute.', retryAfter: rate.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { valid: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const parsed = applyPromoCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    try {
      const supabase = getSupabaseAdmin();
      const result = await validatePromoCode(supabase, {
        code: parsed.data.code,
        coursePrice: parsed.data.coursePrice,
        registrationFee: parsed.data.registrationFee,
        courseId: parsed.data.courseId,
      });

      return NextResponse.json({
        success: result.valid,
        ...result,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, valid: false, error: err.message || 'Failed to validate promo code' },
        { status: 500 }
      );
    }
  },
  { controller: 'CheckoutLandingController', action: 'applyPromoCode' },
);
