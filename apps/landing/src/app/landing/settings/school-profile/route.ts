import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSchoolProfile, updateSchoolProfile } from '@atena/core';
import type { SchoolProfile } from '@atena/api-types';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { withLandingApiLog } from '@/lib/server/api-logger';
import { handleCorsOptions, withCors } from '@/lib/server/cors';

export const runtime = 'nodejs';

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
    const body = (await request.json()) as Partial<SchoolProfile>;
    const supabase = getSupabaseAdmin();
    const updated = await updateSchoolProfile(supabase, body);
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/corsi');
    } catch (revErr) {
      console.warn('[SchoolProfile PATCH] revalidatePath warning:', revErr);
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

