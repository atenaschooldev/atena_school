import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { resolveActiveFormTemplate } from '@atena/core';
import { FormType } from '@atena/api-types';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export const GET = withLandingApiLog(
  async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const formTypeParam = searchParams.get('form_type') || 'booking';
    const courseId = searchParams.get('course_id') || undefined;
    const categorySlug = searchParams.get('category_slug') || undefined;

    const formType =
      formTypeParam === 'contact' ? FormType.CONTACT : FormType.BOOKING;

    try {
      const supabase = getSupabaseAdmin();
      const { data: templates, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.warn('[forms/resolve] Database query error, using built-in fallback:', error.message);
      }

      const template = resolveActiveFormTemplate(templates || [], {
        form_type: formType,
        course_id: courseId,
        category_slug: categorySlug,
      });

      return NextResponse.json({
        success: true,
        template,
      });
    } catch (err: any) {
      console.error('[forms/resolve] Exception:', err);
      const fallback = resolveActiveFormTemplate([], {
        form_type: formType,
        course_id: courseId,
        category_slug: categorySlug,
      });
      return NextResponse.json({
        success: true,
        template: fallback,
      });
    }
  },
  { controller: 'FormsLandingController', action: 'resolveActiveFormTemplate' },
);
