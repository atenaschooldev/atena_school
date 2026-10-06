import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleCorsOptions, withCors } from '@/lib/server/cors';
import { withLandingApiLog } from '@/lib/server/api-logger';

export const runtime = 'nodejs';

export async function OPTIONS() {
  return handleCorsOptions();
}

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentRoute = searchParams.get('route') || '/';
    const device = searchParams.get('device') || 'all';
    const lang = searchParams.get('lang') || '*';
    const supabase = getSupabaseAdmin();

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('marketing_popups')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${nowIso}`)
      .or(`end_date.is.null,end_date.gte.${nowIso}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET /landing/marketing-popups/active error]:', error);
      return withCors(NextResponse.json({ success: true, popup: null }));
    }

    if (!data || data.length === 0) {
      return withCors(NextResponse.json({ success: true, popup: null }));
    }

    // Match route, device and language pattern
    const matching = data.find((popup: any) => {
      // 1. Device filter
      if (popup.target_devices && popup.target_devices !== 'all' && device !== 'all') {
        if (popup.target_devices === 'desktop_only' && device !== 'desktop') return false;
        if (popup.target_devices === 'mobile_only' && device !== 'mobile') return false;
      }

      // 2. Language filter
      if (Array.isArray(popup.target_languages) && popup.target_languages.length > 0 && !popup.target_languages.includes('*')) {
        if (lang !== '*' && !popup.target_languages.includes(lang)) return false;
      }

      // 3. Route filter
      const routes = Array.isArray(popup.target_routes) && popup.target_routes.length > 0
        ? popup.target_routes
        : ['*'];

      if (routes.includes('*')) return true;
      return routes.some((pattern: string) => {
        if (pattern === currentRoute) return true;
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          return currentRoute.startsWith(prefix);
        }
        return false;
      });
    });

    return withCors(NextResponse.json({ success: true, popup: matching || null }));
  } catch (err: any) {
    console.error('[GET /landing/marketing-popups/active fatal error]:', err);
    return withCors(NextResponse.json({ success: true, popup: null }));
  }
}

export const GET = withLandingApiLog(getHandler, {
  controller: 'MarketingPopupsLandingController',
  action: 'getActivePopup',
});
