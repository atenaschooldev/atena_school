import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError, handleApiError } from '../api-response';

describe('Standardized API Response Helpers', () => {
  it('formats apiSuccess correctly', async () => {
    const res = apiSuccess({ bookingId: '123' }, 201);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.bookingId).toBe('123');
  });

  it('formats apiError with RFC 7807 problem details and invalidParams', async () => {
    const res = apiError('Validation failed', 422, { email: ['Invalid email'] }, '/landing/checkout/reserve');
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
    expect(body.type).toBe('https://httpstatuses.com/422');
    expect(body.title).toBe('Unprocessable Entity');
    expect(body.status).toBe(422);
    expect(body.detail).toBe('Validation failed');
    expect(body.instance).toBe('/landing/checkout/reserve');
    expect(body.details).toEqual({ email: ['Invalid email'] });
    expect(body.invalidParams).toEqual({ email: ['Invalid email'] });
  });

  it('formats unhandled exceptions safely with handleApiError conforming to RFC 7807', async () => {
    const err = new Error('Database query failed');
    const res = handleApiError(err, 'Internal Error', '/landing/checkout/stripe-session');
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Database query failed');
    expect(body.type).toBe('https://httpstatuses.com/500');
    expect(body.title).toBe('Internal Server Error');
    expect(body.status).toBe(500);
    expect(body.detail).toBe('Database query failed');
    expect(body.instance).toBe('/landing/checkout/stripe-session');
  });
});

