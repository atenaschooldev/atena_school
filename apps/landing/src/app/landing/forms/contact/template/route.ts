import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { resolveActiveFormTemplate } from '@atena/core';
import { FormType } from '@atena/api-types';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

async function handler() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: templates, error } = await supabase
      .from('form_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.warn('[forms/contact/template] Database query error, using fallback:', error.message);
    }

    const template = resolveActiveFormTemplate(templates || [], {
      form_type: FormType.CONTACT,
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (err: any) {
    console.error('[forms/contact/template] Exception:', err);
    const fallback = resolveActiveFormTemplate([], {
      form_type: FormType.CONTACT,
    });
    return NextResponse.json({
      success: true,
      template: fallback,
    });
  }
}

export const GET = withLandingApiLog(handler, {
  controller: 'FormsPublicLandingController',
  action: 'getContactFormTemplate',
});
