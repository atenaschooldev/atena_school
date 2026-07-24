import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey && data.user.email) {
          const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
          
          await supabaseAdmin
            .from('bookings')
            .update({ user_id: data.user.id })
            .ilike('student_email', data.user.email);

          const { data: latestBooking } = await supabaseAdmin
            .from('bookings')
            .select('student_name, student_phone')
            .ilike('student_email', data.user.email)
            .not('student_phone', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestBooking) {
            const studentName = latestBooking.student_name || '';
            const studentPhone = latestBooking.student_phone || '';
            const nameParts = studentName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            await supabaseAdmin
              .from('users')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                phone: studentPhone || null,
                first_name: firstName || null,
                last_name: lastName || null,
                full_name: studentName || null,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
          }
        }
      } catch (err) {
        console.warn('Error syncing user and bookings in OAuth callback:', err);
      }

      if (process.env.NODE_ENV === 'development') {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const baseUrl = env.NEXT_PUBLIC_SITE_URL || origin;
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  const baseUrl = process.env.NODE_ENV === 'development' ? origin : (env.NEXT_PUBLIC_SITE_URL || origin);
  return NextResponse.redirect(`${baseUrl}/autenticazione/errore`);
}
