import { describe, it, expect } from 'vitest';
import { checkRateLimit, rateLimitExceededResponse, getClientIp } from '../rate-limit';

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

  it('extracts IP correctly from request headers', () => {
    const reqWithForwarded = new Request('http://localhost:3000', {
      headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
    });
    expect(getClientIp(reqWithForwarded)).toBe('192.168.1.1');

    const reqWithRealIp = new Request('http://localhost:3000', {
      headers: { 'x-real-ip': '10.0.0.2' },
    });
    expect(getClientIp(reqWithRealIp)).toBe('10.0.0.2');

    const emptyReq = new Request('http://localhost:3000');
    expect(getClientIp(emptyReq)).toBe('unknown-client');
  });
});
