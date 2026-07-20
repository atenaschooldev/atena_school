import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // In development, redirect dynamically using the request's origin (localhost:3000)
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // In production, use the verified NEXT_PUBLIC_SITE_URL from config to avoid reverse proxy localhost mismatches
      const baseUrl = env.NEXT_PUBLIC_SITE_URL || origin;
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  const baseUrl = process.env.NODE_ENV === 'development' ? origin : (env.NEXT_PUBLIC_SITE_URL || origin);
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
