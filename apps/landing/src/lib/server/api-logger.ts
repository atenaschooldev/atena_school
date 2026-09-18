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
    // Non-blocking logger
    console.error('[logLandingApi failure]:', err);
  }
}
