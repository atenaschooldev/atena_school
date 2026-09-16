import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Returns a standardized JSON success response.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  if (typeof data === 'object' && data !== null && 'success' in data) {
    return NextResponse.json(data, { status });
  }
  return NextResponse.json({ success: true, ...data }, { status });
}

/**
 * Returns a standardized JSON error response.
 */
export function apiError(
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

/**
 * Safely handles and formats unhandled server exceptions without leaking internal secrets.
 */
export function handleApiError(err: unknown, fallbackMessage = 'Internal Server Error'): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  const message = err instanceof Error ? err.message : fallbackMessage;

  console.error('[API Error]:', err);

  return NextResponse.json(
    {
      success: false,
      error: message || fallbackMessage,
      ...(!isProd && err instanceof Error && err.stack ? { stack: err.stack } : {}),
    },
    { status: 500 }
  );
}
