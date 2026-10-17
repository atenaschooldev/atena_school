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
    
    // Strict authentication: in production, require matching secret. Missing or wrong secret -> 401.
    if (!isDev && (!secret || secret !== expectedSecret)) {
      return withCors(
        NextResponse.json({ success: false, error: 'Unauthorized revalidation' }, { status: 401 })
      );
    }

    let body: any = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        // Body might be empty
      }
    }

    const path = body?.path || request.nextUrl.searchParams.get('path');
    const tag = body?.tag || request.nextUrl.searchParams.get('tag');

    let revalidatedTag = false;
    let revalidatedPath = false;

    // 1. Tag-specific targeted revalidation (e.g. 'marketing-popups', 'courses', 'school-profile')
    if (tag) {
      try {
        revalidateTag(tag, 'max');
      } catch {
        (revalidateTag as any)(tag);
      }
      revalidatedTag = true;
    }

    // 2. Path-specific targeted revalidation (e.g. '/corsi', '/test-inglese')
    if (path) {
      revalidatePath(path);
      revalidatedPath = true;
    }

    // 3. Fallback: ONLY if NEITHER tag NOR path was specified, perform full site revalidation
    if (!revalidatedTag && !revalidatedPath) {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/corsi');
      try {
        revalidateTag('school-profile', 'max');
        revalidateTag('form-templates', 'max');
        revalidateTag('courses', 'max');
      } catch {
        (revalidateTag as any)('school-profile');
        (revalidateTag as any)('form-templates');
        (revalidateTag as any)('courses');
      }
    }

    return withCors(
      NextResponse.json({
        success: true,
        revalidated: true,
        type: revalidatedTag ? 'tag' : revalidatedPath ? 'path' : 'all',
        path: path || (revalidatedTag ? null : 'all'),
        tag: tag || (revalidatedPath ? null : 'all'),
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
