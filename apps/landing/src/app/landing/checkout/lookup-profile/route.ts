import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { getUserLatestProfile } from '@atena/core';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export const POST = withLandingApiLog(
  async (request: NextRequest) => {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`lookup-profile:${ip}`, { intervalMs: 60 * 1000, maxRequests: 30 });
    if (!rate.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.', retryAfter: rate.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
      );
    }

    let body: { email?: string; taxCode?: string; userId?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if authorization header or token is present
    let authUserId = body.userId;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        authUserId = user.id;
        if (!body.email) {
          body.email = user.email;
        }
      }
    }

    try {
      const result = await getUserLatestProfile(supabaseAdmin, {
        userId: authUserId,
        email: body.email,
        taxCode: body.taxCode,
      });

      // Security / GDPR: Only return full personal details if the user is authenticated via Bearer JWT
      if (!authUserId) {
        return NextResponse.json({
          success: true,
          userFound: Boolean(result.purchaser || (result.students && result.students.length > 0)),
          purchaser: null,
          students: [],
        });
      }

      return NextResponse.json(result);
    } catch (err: any) {
      console.error('[API /checkout/lookup-profile] Error:', err);
      return NextResponse.json(
        { success: false, error: err.message || 'Failed to lookup profile' },
        { status: 500 }
      );
    }
  },
  { controller: 'CheckoutLandingController', action: 'lookupProfile' }
);
