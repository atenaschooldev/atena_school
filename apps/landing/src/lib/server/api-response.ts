import { NextResponse } from 'next/server';
import { captureExceptionToSentry } from '@atena/core';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  invalidParams?: unknown;
}

const HTTP_STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

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
 * Returns a standardized JSON error response conforming to RFC 7807 Problem Details.
 */
export function apiError(
  message: string,
  status = 400,
  details?: unknown,
  instance?: string
): NextResponse {
  const title = HTTP_STATUS_TITLES[status] || 'Error';
  const typeUri = `https://httpstatuses.com/${status}`;

  const payload: Record<string, unknown> = {
    success: false,
    error: message,
    type: typeUri,
    title,
    status,
    detail: message,
    ...(instance ? { instance } : {}),
    ...(details ? { details, invalidParams: details } : {}),
  };

  return NextResponse.json(payload, { status });
}

/**
 * Safely handles and formats unhandled server exceptions conforming to RFC 7807,
 * and reports them asynchronously to Sentry.
 */
export function handleApiError(err: unknown, fallbackMessage = 'Internal Server Error', instance?: string): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  const message = err instanceof Error ? err.message : fallbackMessage;

  console.error('[API Error]:', err);

  // Asynchronously forward to Sentry without blocking response
  captureExceptionToSentry(err, {
    instance: instance || 'landing-api',
    tags: { runtime: 'nextjs-api-route' },
  }).catch(() => {});

  const payload: Record<string, unknown> = {
    success: false,
    error: message || fallbackMessage,
    type: 'https://httpstatuses.com/500',
    title: 'Internal Server Error',
    status: 500,
    detail: message || fallbackMessage,
    ...(instance ? { instance } : {}),
    ...(!isProd && err instanceof Error && err.stack ? { stack: err.stack } : {}),
  };

  return NextResponse.json(payload, { status: 500 });
}

