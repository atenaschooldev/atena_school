import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/server/checkout-service';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function handler(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature') || '';
    const rawBody = await request.text();
    const result = await handleStripeWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

export const POST = withLandingApiLog(handler, {
  controller: 'StripeWebhookController',
  action: 'handleStripeWebhook',
});
