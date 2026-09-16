import { describe, it, expect } from 'vitest';
import { checkRateLimit, rateLimitExceededResponse } from '../rate-limit';

describe('Serverless In-Memory Rate Limiter', () => {
  it('allows requests within limit', () => {
    const testId = `test-ip-${Date.now()}`;
    const res1 = checkRateLimit(testId, { intervalMs: 10000, maxRequests: 2 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(testId, { intervalMs: 10000, maxRequests: 2 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it('blocks requests exceeding limit and calculates retryAfter', () => {
    const testId = `test-ip-blocked-${Date.now()}`;
    checkRateLimit(testId, { intervalMs: 10000, maxRequests: 1 });
    const blocked = checkRateLimit(testId, { intervalMs: 10000, maxRequests: 1 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('generates standard 429 response with Retry-After header', async () => {
    const res = rateLimitExceededResponse(45);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('45');

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.retryAfter).toBe(45);
  });
});
