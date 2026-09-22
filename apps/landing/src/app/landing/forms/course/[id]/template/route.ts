import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { resolveActiveFormTemplate } from '@atena/core';
import { FormType } from '@atena/api-types';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanCourseId = (id || '').trim();

    const supabase = getSupabaseAdmin();
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.warn('[forms/course/template] Database query error, using fallback:', error.message);
    }

    const template = resolveActiveFormTemplate(templates || [], {
      form_type: FormType.BOOKING,
      course_id: cleanCourseId,
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (err: any) {
    console.error('[forms/course/template] Exception:', err);
    const fallback = resolveActiveFormTemplate([], {
      form_type: FormType.BOOKING,
    });
    return NextResponse.json({
      success: true,
      template: fallback,
    });
  }
}

export const GET = withLandingApiLog(handler, {
  controller: 'FormsPublicLandingController',
  action: 'getCourseFormTemplate',
});
