import type {
  FeeStatusResponse,
  ReservationResponse,
  CheckoutSessionResponse,
  SiteContentResponse,
  CourseItem,
  BookingRecord,
} from "@atena/api-types";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.message || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface ReservationPayload {
  itemId: string;
  itemType?: string;
  date?: string;
  time?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  purchaserTaxCode?: string;
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentTaxCode?: string;
  studentBirthDate?: string;
  includeRegistrationFee?: boolean;
}

export interface StripeSessionPayload extends ReservationPayload {
  successUrl?: string;
  cancelUrl?: string;
}

export function createApiClient(baseUrl?: string) {
  const apiBase = baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  return {
    checkout: {
      async checkFeeStatus(params: { taxCode?: string; email?: string; phone?: string }): Promise<FeeStatusResponse> {
        const res = await fetch(`${apiBase}/api/v1/checkout/check-fee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        return handleResponse<FeeStatusResponse>(res);
      },

      async createReservation(payload: ReservationPayload | Record<string, unknown>): Promise<ReservationResponse> {
        const res = await fetch(`${apiBase}/api/v1/checkout/reserve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return handleResponse<ReservationResponse>(res);
      },

      async createStripeSession(payload: StripeSessionPayload | Record<string, unknown>): Promise<CheckoutSessionResponse> {
        const res = await fetch(`${apiBase}/api/v1/checkout/create-stripe-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return handleResponse<CheckoutSessionResponse>(res);
      },

      async getItem(itemId: string): Promise<{ success: boolean; item: CourseItem }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/item/${itemId}`);
        return handleResponse<{ success: boolean; item: CourseItem }>(res);
      },

      async getBookingDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/booking-details/${bookingId}`);
        return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
      },

      async verifyPayment(dto: { sessionId: string; bookingId: string }): Promise<{ success: boolean; booking: BookingRecord }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dto),
        });
        return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
      },
    },

    portal: {
      async getDashboard(token: string) {
        const res = await fetch(`${apiBase}/api/v1/portal/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return handleResponse(res);
      },

      async updateProfile(token: string, data: { profileName: string; profilePhone: string }) {
        const res = await fetch(`${apiBase}/api/v1/portal/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      },
    },

    cms: {
      async getCourses(): Promise<{ success: boolean; courses: CourseItem[] }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/courses`);
        return handleResponse<{ success: boolean; courses: CourseItem[] }>(res);
      },
    },
  };
}
