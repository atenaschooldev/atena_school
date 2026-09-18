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
      endpoint: params.endpoint,
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
        ipAddress,
        userAgent,
        request: { body: requestBody, query: Object.keys(queryParams).length ? queryParams : null },
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
        ipAddress,
        userAgent,
        request: { body: requestBody, query: Object.keys(queryParams).length ? queryParams : null },
        response: { error: err?.message || 'Internal Server Error' },
        statusCode,
      });
      throw err;
    }
  };
}
