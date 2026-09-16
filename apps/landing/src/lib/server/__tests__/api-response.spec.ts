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

  it('formats apiError with details', async () => {
    const res = apiError('Validation failed', 422, { email: ['Invalid email'] });
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Validation failed');
    expect(body.details).toEqual({ email: ['Invalid email'] });
  });

  it('formats unhandled exceptions safely with handleApiError', async () => {
    const err = new Error('Database query failed');
    const res = handleApiError(err);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Database query failed');
  });
});
