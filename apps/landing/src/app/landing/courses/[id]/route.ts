import { NextRequest, NextResponse } from 'next/server';
import { getCourse } from '@/lib/server/checkout-service';
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
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    const result = await getCourse(cleanId);
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

export const GET = withLandingApiLog(handler, {
  controller: 'CoursesPublicController',
  action: 'getCourse',
});
