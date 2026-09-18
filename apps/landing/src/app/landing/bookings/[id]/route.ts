import { NextRequest, NextResponse } from 'next/server';
import { getBookingDetails } from '@/lib/server/checkout-service';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = (id || '').trim();
    if (!cleanId || cleanId.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }
    const result = await getBookingDetails(cleanId);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

export const GET = withLandingApiLog(handler, {
  controller: 'BookingsPublicController',
  action: 'getBookingDetails',
});
