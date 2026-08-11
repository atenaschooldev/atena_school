import { NextRequest, NextResponse } from 'next/server';
import { createStripeSession } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createStripeSession(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create Stripe checkout session' },
      { status: 400 }
    );
  }
}
