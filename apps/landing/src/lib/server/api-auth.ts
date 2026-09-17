import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates whether an incoming HTTP request possesses valid authorization
 * to access internal/administrative microservice routes (Telegram, Mailers, Reminders).
 * 
 * Supports:
 * 1. Bearer token in Authorization header matching INTERNAL_API_SECRET or SUPABASE_SERVICE_ROLE_KEY
 * 2. x-api-key header matching INTERNAL_API_SECRET or SUPABASE_SERVICE_ROLE_KEY
 */
export function validateInternalAuth(request: NextRequest): { authorized: boolean; errorResponse?: NextResponse } {
  const authHeader = request.headers.get('authorization') || '';
  const apiKeyHeader = request.headers.get('x-api-key') || '';

  const internalSecret = process.env.INTERNAL_API_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const validSecrets = [internalSecret, serviceRoleKey].filter(Boolean) as string[];

  // If no internal secret or service role key is configured in production, block external access
  if (validSecrets.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: 'Unauthorized: Internal API secret is not configured' },
          { status: 401 }
        ),
      };
    }
    // Allow local development without explicit secret
    return { authorized: true };
  }

  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : authHeader.trim();

  const tokenToTest = bearerToken || apiKeyHeader.trim();

  if (!tokenToTest || !validSecrets.includes(tokenToTest)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true };
}
