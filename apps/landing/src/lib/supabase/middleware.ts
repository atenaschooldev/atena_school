import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Защита роутов (учитываем, что путь может содержать локаль, например /it/dashboard)
  const isDashboard = request.nextUrl.pathname.match(/\/(it|en)\/dashboard/);
  // Также может быть /dashboard без локали до middleware, но лучше проверять через includes:
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard') || request.nextUrl.pathname.includes('/checkout');
  const isAdminRoute = request.nextUrl.pathname.includes('/admin');

  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    // Извлекаем локаль, если она есть
    const localeMatch = request.nextUrl.pathname.match(/^\/(it|en)\//);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
    
    const fullPath = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = `${localePrefix}/auth/login`;
    const keys = Array.from(url.searchParams.keys());
    keys.forEach(key => url.searchParams.delete(key));
    url.searchParams.set('redirect', fullPath);
    
    return NextResponse.redirect(url)
  }

  // Перевірка прав адміністратора для /admin роутів
  // Подвійний захист:
  //  1. profiles.role === 'admin'   (роль у БД, виставляється тільки через auth callback + whitelist)
  //  2. app_metadata.provider === 'google'  (тільки Google OAuth юзери можуть бути адмінами)
  if (user && isAdminRoute) {
    const provider = user.app_metadata?.provider ?? '';

    // Blocker 1: must be Google OAuth
    if (provider !== 'google') {
      const url = request.nextUrl.clone();
      const localeMatch = request.nextUrl.pathname.match(/^\/(it|en)\//);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
      url.pathname = `${localePrefix}/`;
      return NextResponse.redirect(url);
    }

    // Blocker 2: must have admin role in DB
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      const localeMatch = request.nextUrl.pathname.match(/^\/(it|en)\//);
      const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
      url.pathname = `${localePrefix}/`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse
}
