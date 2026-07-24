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
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Protect dashboard routes
  const isProtectedRoute = request.nextUrl.pathname.includes('/dashboard');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    const fullPath = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = `/autenticazione/accedi`;
    const keys = Array.from(url.searchParams.keys());
    keys.forEach(key => url.searchParams.delete(key));
    url.searchParams.set('redirect', fullPath);
    
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
