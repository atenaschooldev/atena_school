import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First evaluate Supabase session and route protection
  const supabaseResponse = await updateSession(request);
  
  // Если Supabase прервал запрос и запросил редирект на /login (статус 307/308)
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }
  
  // В противном случае пропускаем через i18n
  const intlResponse = intlMiddleware(request);
  
  // Копируем куки авторизации (если токен обновился) в финальный ответ
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });
  
  return intlResponse;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(it|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
