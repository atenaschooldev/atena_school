import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Never intercept OAuth callback or error pages
  if (
    pathname.startsWith('/autenticazione/callback') ||
    pathname.startsWith('/autenticazione/errore')
  ) {
    return supabaseResponse;
  }

  // 1. Unauthenticated users: redirect protected routes or root to clean /autenticazione
  const isProtectedRoute = pathname.startsWith('/dashboard');
  if (!user && (isProtectedRoute || pathname === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/autenticazione';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users: redirect auth entry points or root to /dashboard
  const isAuthEntryRoute =
    pathname === '/autenticazione' ||
    pathname === '/autenticazione/accedi' ||
    pathname === '/autenticazione/registrati';

  if (user && (isAuthEntryRoute || pathname === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
