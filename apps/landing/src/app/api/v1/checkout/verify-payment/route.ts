import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await verifyPayment(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to verify payment' },
      { status: 400 }
    );
  }
}
