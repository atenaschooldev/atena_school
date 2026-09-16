import { NextResponse } from 'next/server';

interface RateLimitOptions {
  intervalMs: number;
  maxRequests: number;
}

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitTracker>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Checks if an IP or identifier has exceeded the rate limit.
 * @param identifier Client IP address or unique request identifier
 * @param options Rate limit options (intervalMs and maxRequests)
 * @returns { success: boolean, remaining: number, resetTime: number, retryAfter: number }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60 * 1000, maxRequests: 20 }
): { success: boolean; remaining: number; resetTime: number; retryAfter: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    const resetTime = now + options.intervalMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime,
      retryAfter: Math.max(1, Math.ceil(options.intervalMs / 1000)),
    };
  }

  const retryAfter = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));

  if (existing.count >= options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
      retryAfter,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: options.maxRequests - existing.count,
    resetTime: existing.resetTime,
    retryAfter,
  };
}

/**
 * Creates a standard 429 Too Many Requests response with Retry-After header.
 */
export function rateLimitExceededResponse(retryAfter: number = 60): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Troppe richieste. Riprova tra qualche secondo.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    }
  );
}

/**
 * Helper to extract client IP from Next.js NextRequest headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown-client';
}

