import { NextRequest, NextResponse } from 'next/server';
import { getItem } from '@/lib/server/checkout-service';

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
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    const result = await getItem(cleanId);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
