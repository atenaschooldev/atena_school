import { NextResponse } from 'next/server';
import { getDomainsCredentials } from '@atena/core';
import { createClient } from '@/lib/supabase/server';
import { handleCorsOptions, withCors } from '@/lib/server/cors';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  try {
    const supabase = createClient();
    const domains = await getDomainsCredentials(supabase as any);
    return withCors(NextResponse.json({ success: true, domains }));
  } catch (err: any) {
    const isDev = process.env.NODE_ENV === 'development';
    return withCors(
      NextResponse.json({
        success: true,
        domains: {
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (isDev ? 'http://localhost:3000' : 'https://atenaschool.com'),
          appUrl: process.env.NEXT_PUBLIC_APP_URL || (isDev ? 'http://localhost:3002' : 'https://app.atenaschool.com'),
          adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || (isDev ? 'http://localhost:3001' : 'https://atena-school-admin.vercel.app'),
        },
      })
    );
  }
}
