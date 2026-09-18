import { NextResponse } from 'next/server';
import { getPublicCourses } from '@/lib/server/checkout-service';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function handler() {
  try {
    const result = await getPublicCourses();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export const GET = withLandingApiLog(handler, {
  controller: 'CoursesPublicController',
  action: 'getPublicCourses',
});
