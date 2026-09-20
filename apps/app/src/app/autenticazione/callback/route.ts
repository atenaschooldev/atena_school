import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/config/env';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const errorDescription = searchParams.get('error_description') || searchParams.get('error');

  if (errorDescription) {
    console.error('[Auth Callback] OAuth provider error:', errorDescription);
    return NextResponse.redirect(`${origin}/autenticazione/errore?msg=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    const baseUrl = (!isLocalEnv && forwardedHost) ? `https://${forwardedHost}` : origin;
    const targetPath = (next && next.startsWith('/') && !next.startsWith('/autenticazione')) ? next : '/dashboard';
    const redirectUrl = `${baseUrl}${targetPath}`;

    let response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && (data?.session || data?.user)) {
      return response;
    } else {
      console.error('[Auth Callback] exchangeCodeForSession failed:', error?.message);
    }
  }

  const errorUrl = new URL('/autenticazione/errore', origin);
  return NextResponse.redirect(errorUrl.toString());
}
