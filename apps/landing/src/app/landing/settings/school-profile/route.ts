import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSchoolProfile, updateSchoolProfile } from '@atena/core';
import type { SchoolProfile } from '@atena/api-types';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { withLandingApiLog } from '@/lib/server/api-logger';
import { handleCorsOptions, withCors } from '@/lib/server/cors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS() {
  return handleCorsOptions();
}

async function getHandler() {
  try {
    const supabase = getSupabaseAdmin();
    const profile = await getSchoolProfile(supabase);
    return withCors(NextResponse.json({ success: true, profile }));
  } catch (err: any) {
    console.error('[GET /landing/settings/school-profile error]:', err);
    return withCors(
      NextResponse.json(
        { success: false, error: err.message || 'Failed to fetch school profile' },
        { status: 500 }
      )
    );
  }
}

async function patchHandler(request: NextRequest) {
  try {
    const secret =
      request.headers.get('x-revalidation-secret') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      request.nextUrl.searchParams.get('secret');

    const expectedSecret =
      process.env.REVALIDATION_SECRET ||
      process.env.INTERNAL_API_SECRET ||
      'atena-revalidation-secret';

    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && (!secret || secret !== expectedSecret)) {
      return withCors(
        NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      );
    }

    const body = (await request.json()) as Partial<SchoolProfile>;
    const supabase = getSupabaseAdmin();
    const updated = await updateSchoolProfile(supabase, body);
    try {
      revalidateTag('school-profile', 'max');
    } catch {
      (revalidateTag as any)('school-profile');
    }
    return withCors(NextResponse.json({ success: true, profile: updated }));
  } catch (err: any) {
    console.error('[PATCH /landing/settings/school-profile error]:', err);
    return withCors(
      NextResponse.json(
        { success: false, error: err.message || 'Failed to update school profile' },
        { status: 500 }
      )
    );
  }
}

export const GET = withLandingApiLog(getHandler, {
  controller: 'SettingsLandingController',
  action: 'getSchoolProfile',
});

export const PATCH = withLandingApiLog(patchHandler, {
  controller: 'SettingsLandingController',
  action: 'updateSchoolProfile',
});

