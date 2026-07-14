import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Обработка CORS (preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Разрешаем вызов только с помощью service_role key
    let isAuthorized = false;
    if (authHeader === `Bearer ${serviceRoleKey}`) {
      isAuthorized = true;
    } else if (authHeader) {
      // Резервная авторизация для админов
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      if (user && !error) {
        const { data: userData } = await supabaseClient
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (userData?.role === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { from, to, subject, html, text, cc, bcc, reply_to } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, and either html or text are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const resend = new Resend(resendApiKey);

    const defaultFrom = Deno.env.get('RESEND_FROM_EMAIL') || 'Atena School <info@atena.school>';
    const emailFrom = from || defaultFrom;

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || undefined,
      text: text || undefined,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      reply_to: reply_to || undefined,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Error sending email:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
