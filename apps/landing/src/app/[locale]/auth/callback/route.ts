import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, isAdminUser } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // --- Admin whitelist check ---
      // Grant admin role ONLY when:
      //  1. Provider is Google OAuth
      //  2. Email is in the ADMIN_EMAILS server-side whitelist
      if (isAdminUser(user)) {
        try {
          const adminClient = createAdminClient();
          await adminClient
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
        } catch (e) {
          // Non-fatal — user can still log in, just won't have admin rights
          console.error('[auth/callback] Failed to set admin role:', e);
        }
      }

      // --- Redirect ---
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
