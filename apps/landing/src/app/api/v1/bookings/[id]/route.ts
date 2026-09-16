import { NextRequest, NextResponse } from 'next/server';
import { getBookingDetails } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function GET(
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
