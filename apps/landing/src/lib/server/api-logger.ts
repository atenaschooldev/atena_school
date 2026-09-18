import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabase-admin';

export interface LogLandingApiParams {
  controller?: string;
  action: string;
  httpMethod: string;
  endpoint: string;
  userId?: string | null;
  userRole?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  request?: any;
  response?: any;
  statusCode: number;
}

export async function logLandingApi(params: LogLandingApiParams): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      try {
        const cloned = JSON.parse(JSON.stringify(obj));
        const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret', 'cardNumber', 'cvc'];
        const walk = (target: any) => {
          if (!target || typeof target !== 'object') return;
          for (const key of Object.keys(target)) {
            if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
              target[key] = '***MASKED***';
            } else if (typeof target[key] === 'object') {
              walk(target[key]);
            }
          }
        };
        walk(cloned);
        return cloned;
      } catch {
        return obj;
      }
    };

    await supabase.from('landing_api_logs').insert({
      controller: params.controller || 'LandingRouteHandler',
      action: params.action,
      http_method: params.httpMethod.toUpperCase(),
      endpoint: (params.endpoint || '').replace(/^\/+/, ''),
      user_id: params.userId || null,
      user_role: params.userRole || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      request: sanitize(params.request),
      response: sanitize(params.response),
      status_code: params.statusCode,
    });
  } catch (err) {
    console.error('[logLandingApi failure]:', err);
  }
}

export interface LogNotificationParams {

  channel: number; // 1: EMAIL, 2: TELEGRAM
  notificationType: number; // NotificationType
  recipient: string;
  subject?: string | null;
  request: any;
  response?: any;
  status: number; // 1: SENT, 2: FAILED
}

export async function logNotification(params: LogNotificationParams): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('notification_logs').insert({
      channel: params.channel,
      notification_type: params.notificationType,
      recipient: params.recipient,
      subject: params.subject || null,
      request: params.request || {},
      response: params.response || null,
      status: params.status,
    });
  } catch (err) {
    console.error('[logNotification failure]:', err);
  }
}


async function resolveLogUser(
  request: NextRequest,
  requestBody: any,
  queryParams: Record<string, string>,
): Promise<{ userId: string | null; userRole: number | null }> {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Try Bearer token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) {
        const { data: dbUser } = await supabase.from('users').select('id, role').eq('id', user.id).maybeSingle();
        return { userId: user.id, userRole: dbUser?.role ?? null };
      }
    }

    // 2. Try Supabase Auth cookie
    const allCookies = request.cookies.getAll();
    const authCookie = allCookies.find((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (authCookie?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(authCookie.value));
        const token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
        if (token && typeof token === 'string') {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user?.id) {
            const { data: dbUser } = await supabase.from('users').select('id, role').eq('id', user.id).maybeSingle();
            return { userId: user.id, userRole: dbUser?.role ?? null };
          }
        }
      } catch {}
    }

    // 3. Smart Guest Matching: Check email from body or query
    const candidateEmail = requestBody?.email || requestBody?.purchaserEmail || requestBody?.studentEmail || queryParams?.email;
    if (candidateEmail && typeof candidateEmail === 'string' && candidateEmail.includes('@')) {
      const { data: userByEmail } = await supabase
        .from('users')
        .select('id, role')
        .ilike('email', candidateEmail.trim())
        .maybeSingle();
      if (userByEmail?.id) {
        return { userId: userByEmail.id, userRole: userByEmail.role ?? null };
      }
    }

    // 4. Smart Guest Matching: Check tax code from body or query
    const candidateTaxCode = requestBody?.taxCode || requestBody?.purchaserTaxCode || requestBody?.studentTaxCode || queryParams?.taxCode;
    if (candidateTaxCode && typeof candidateTaxCode === 'string' && candidateTaxCode.trim().length >= 11) {
      const { data: userByTax } = await supabase
        .from('users')
        .select('id, role')
        .ilike('tax_code', candidateTaxCode.trim())
        .maybeSingle();
      if (userByTax?.id) {
        return { userId: userByTax.id, userRole: userByTax.role ?? null };
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  return { userId: null, userRole: null };
}

/**
 * Higher-order wrapper to automatically log Next.js Route Handler executions to landing_api_logs
 */
export function withLandingApiLog(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse | Response>,
  options: { controller?: string; action: string },
) {
  return async (request: NextRequest, context?: any) => {
    const url = request.nextUrl.pathname;
    const httpMethod = request.method;
    const ipAddress = request.headers.get('x-forwarded-for') || null;
    const userAgent = request.headers.get('user-agent') || null;
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('atena_session_id')?.value || null;

    let requestBody: any = null;
    try {
      if (['POST', 'PUT', 'PATCH'].includes(httpMethod)) {
        const cloned = request.clone();
        requestBody = await cloned.json().catch(() => null);
      }
    } catch {
      // Ignore body parse errors
    }

    const queryParams: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const { userId, userRole } = await resolveLogUser(request, requestBody, queryParams);

    const requestPayload = {
      body: requestBody,
      query: Object.keys(queryParams).length ? queryParams : null,
      sessionId: sessionId || undefined,
    };

    try {
      const response = await handler(request, context);
      const statusCode = response.status || 200;

      let responseBody: any = null;
      try {
        const resClone = response.clone();
        const contentType = resClone.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          responseBody = await resClone.json().catch(() => null);
        }
      } catch {
        // Ignore response body parse errors
      }

      logLandingApi({
        controller: options.controller || 'LandingRouteHandler',
        action: options.action,
        httpMethod,
        endpoint: url,
        userId,
        userRole,
        ipAddress,
        userAgent,
        request: requestPayload,
        response: responseBody,
        statusCode,
      });

      return response;
    } catch (err: any) {
      const statusCode = 500;
      logLandingApi({
        controller: options.controller || 'LandingRouteHandler',
        action: options.action,
        httpMethod,
        endpoint: url,
        userId,
        userRole,
        ipAddress,
        userAgent,
        request: requestPayload,
        response: { error: err?.message || 'Internal Server Error' },
        statusCode,
      });
      throw err;
    }
  };
}
