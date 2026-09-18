import { NextRequest, NextResponse } from 'next/server';
import { validateInternalAuth } from '@/lib/server/api-auth';
import { withLandingApiLog } from '@/lib/server/api-logger';

async function handler(request: NextRequest) {
  const auth = validateInternalAuth(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { bookingId, customNote } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing required field: bookingId' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bookingId,
      customNote: customNote || null,
      sentAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export const POST = withLandingApiLog(handler, {
  controller: 'MailController',
  action: 'sendPaymentReminder',
});
