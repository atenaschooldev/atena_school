import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { handleCorsOptions, withCors } from '@/lib/server/cors';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleCorsOptions();
}

async function revalidateHandler(request: NextRequest) {
  try {
    const secret =
      request.headers.get('x-revalidation-secret') ||
      request.nextUrl.searchParams.get('secret');
    const expectedSecret =
      process.env.REVALIDATION_SECRET ||
      process.env.INTERNAL_API_SECRET ||
      'atena-revalidation-secret';

    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && secret && secret !== expectedSecret) {
      return withCors(
        NextResponse.json({ success: false, error: 'Unauthorized revalidation' }, { status: 401 })
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body might be empty, that's completely normal
    }

    const path = body?.path || request.nextUrl.searchParams.get('path');
    const tag = body?.tag || request.nextUrl.searchParams.get('tag');

    if (tag) {
      try {
        revalidateTag(tag, 'max');
      } catch {
        // Fallback if older Next signature
        (revalidateTag as any)(tag);
      }
    }

    if (path) {
      revalidatePath(path);
      if (path === '/' || path === '') {
        revalidatePath('/', 'layout');
      }
    } else {
      // Default: purge entire site layout & core pages
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/corsi');
      revalidatePath('/test-inglese');
      try {
        revalidateTag('school-profile', 'max');
        revalidateTag('form-templates', 'max');
        revalidateTag('courses', 'max');
        revalidateTag('analytics', 'max');
      } catch {
        (revalidateTag as any)('school-profile');
        (revalidateTag as any)('form-templates');
        (revalidateTag as any)('courses');
        (revalidateTag as any)('analytics');
      }
    }

    return withCors(
      NextResponse.json({
        success: true,
        revalidated: true,
        path: path || 'all',
        tag: tag || 'all',
        timestamp: new Date().toISOString(),
      })
    );
  } catch (err: any) {
    console.error('[POST /landing/revalidate error]:', err);
    return withCors(
      NextResponse.json(
        { success: false, error: err?.message || 'Revalidation failed' },
        { status: 500 }
      )
    );
  }
}

export const POST = withLandingApiLog(revalidateHandler, {
  controller: 'RevalidationController',
  action: 'revalidateLandingCache',
});

export const GET = withLandingApiLog(revalidateHandler, {
  controller: 'RevalidationController',
  action: 'revalidateLandingCacheGet',
});
