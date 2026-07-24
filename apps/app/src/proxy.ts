import { updateSession } from './lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
