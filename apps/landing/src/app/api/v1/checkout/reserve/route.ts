import { NextRequest, NextResponse } from 'next/server';
import { createReservation } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createReservation(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create reservation' },
      { status: 400 }
    );
  }
}
