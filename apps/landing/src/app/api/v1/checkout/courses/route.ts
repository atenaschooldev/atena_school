import { NextResponse } from 'next/server';
import { getPublicCourses } from '@/lib/server/checkout-service';

export const runtime = 'nodejs';

export async function GET() {
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
