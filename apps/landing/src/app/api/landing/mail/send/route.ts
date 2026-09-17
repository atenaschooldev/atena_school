import { NextRequest, NextResponse } from 'next/server';
import { validateInternalAuth } from '@/lib/server/api-auth';

export async function POST(request: NextRequest) {
  const auth = validateInternalAuth(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and text/html are required' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Atena School <onboarding@resend.dev>';

    if (!resendApiKey) {
      console.log(`[MAIL MOCK]: To: ${to}, Subject: ${subject}`);
      return NextResponse.json({ success: true, id: 'mock-id-no-resend-key' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        text: text || '',
        html: html || text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Resend error' }, { status: response.status });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
