import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/server/checkout-service';
import { verifyPaymentSchema } from '@atena/validators';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function handler(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  try {
    const result = await verifyPayment(parsed.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to verify payment' },
      { status: 400 }
    );
  }
}

export const POST = withLandingApiLog(handler, {
  controller: 'CheckoutPublicController',
  action: 'verifyPayment',
});
