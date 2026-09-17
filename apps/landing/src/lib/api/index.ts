import { createApiClient, ApiError, type ContactFormPayload } from '@atena/api-client';
import type {
  FeeStatusResponse,
  ReservationResponse,
  CheckoutSessionResponse,
  CourseItem,
  BookingRecord,
} from '@atena/api-types';

export { ApiError };

const backendUrl = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || '')
  : (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '');

const baseClient = createApiClient(backendUrl);

/**
 * Unified API Client for Atena School Landing
 * 
 * - In Vercel Serverless mode (NEXT_PUBLIC_BACKEND_URL=""): calls relative `/landing/*` endpoints.
 * - In NestJS mode (e.g. NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"): calls NestJS `/v1/*` endpoints directly.
 */
export const api = {
  courses: {
    getAll: () => baseClient.landing.courses.getAll(),
    getById: (id: string) => baseClient.landing.courses.getById(id),
  },
  checkout: {
    checkFee: (taxCode: string): Promise<FeeStatusResponse> =>
      baseClient.landing.checkout.checkFee({ taxCode }),
    reserve: (payload: Record<string, unknown>): Promise<ReservationResponse> =>
      baseClient.landing.checkout.reserve(payload),
    createStripeSession: (payload: Record<string, unknown>): Promise<CheckoutSessionResponse> =>
      baseClient.landing.checkout.createStripeSession(payload),
    verifyPayment: (dto: { sessionId: string; bookingId: string }): Promise<{ success: boolean; booking: BookingRecord }> =>
      baseClient.landing.checkout.verifyPayment(dto),
  },
  bookings: {
    getById: (bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> =>
      baseClient.landing.bookings.getById(bookingId),
  },
  contact: {
    submit: (payload: ContactFormPayload) => baseClient.landing.contact.submit(payload),
  },
  settings: {
    getPaymentGateway: () => baseClient.landing.settings.getPaymentGateway(),
  },
  auth: {
    async sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
      const endpoint = backendUrl && baseClient.isNest
        ? `${backendUrl}/v1/auth/magic-link`
        : (backendUrl ? `${backendUrl}/landing/auth/magic-link` : '/landing/auth/magic-link');
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        return await res.json();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        return { success: false, error: msg };
      }
    },
  },
};

export default api;
