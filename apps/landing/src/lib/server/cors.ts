import { NextResponse } from 'next/server';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-session-id, sentry-trace, baggage, accept',
};

export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function withCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, val]) => {
    response.headers.set(key, val);
  });
  return response;
}
