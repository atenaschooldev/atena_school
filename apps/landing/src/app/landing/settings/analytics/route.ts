import { NextResponse } from 'next/server';
import { getAnalyticsCredentials, getSentryCredentials } from '@atena/core';
import { createClient } from '@/lib/supabase/server';
import { handleCorsOptions, withCors } from '@/lib/server/cors';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  try {
    const supabase = createClient();
    const [analytics, sentry] = await Promise.all([
      getAnalyticsCredentials(supabase as any),
      getSentryCredentials(supabase as any),
    ]);
    return withCors(NextResponse.json({ success: true, analytics, sentryDsn: sentry.dsn || '' }));
  } catch (err: any) {
    return withCors(
      NextResponse.json({
        success: true,
        analytics: {
          gaId: process.env.NEXT_PUBLIC_GA_ID || '',
          gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
          clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || '',
          metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
        },
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || '',
      })
    );
  }
}
