import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { autoLinkGuestBookings } from '@repo/api';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user && data.user.email) {
      try {
        await autoLinkGuestBookings(data.user.email, data.user.id, supabase);
      } catch (err) {
        console.warn('Error syncing user and bookings in OAuth callback:', err);
      }

      const targetPath = next.startsWith('/') ? next : '/dashboard';
      const targetUrl = new URL(targetPath, origin);
      return NextResponse.redirect(targetUrl.toString());
    }
  }

  const errorUrl = new URL('/autenticazione/errore', origin);
  return NextResponse.redirect(errorUrl.toString());
}
