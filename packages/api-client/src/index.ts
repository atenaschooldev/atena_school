import type {
  FeeStatusResponse,
  ReservationResponse,
  CheckoutSessionResponse,
  SiteContentResponse,
  CourseItem,
  BookingRecord,
} from "@atena/api-types";

declare const process: { env?: Record<string, string | undefined> } | undefined;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.message || errData?.error || `API Error: ${res.status} ${res.statusText}`);
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

export interface ContactFormPayload {
  nome?: string;
  cognome?: string;
  name?: string;
  email: string;
  phone?: string;
  telefono?: string;
  message?: string;
  messaggio?: string;
  interest?: string;
  interesse?: string | null;
  courseInterest?: string;
}

export function createApiClient(baseUrl?: string) {
  const envUrl = typeof process !== "undefined" && process?.env ? process.env.NEXT_PUBLIC_BACKEND_URL : undefined;
  const apiBase = baseUrl || envUrl || "http://localhost:4000";

  return {
    landing: {
      courses: {
        async getAll(): Promise<{ success: boolean; courses: CourseItem[] }> {
          const res = await fetch(`${apiBase}/api/landing/courses`);
          return handleResponse<{ success: boolean; courses: CourseItem[] }>(res);
        },
        async getById(id: string): Promise<{ success: boolean; item?: CourseItem; course?: CourseItem }> {
          const res = await fetch(`${apiBase}/api/landing/courses/${id}`);
          return handleResponse<{ success: boolean; item?: CourseItem; course?: CourseItem }>(res);
        },
      },
      checkout: {
        async checkFee(params: { taxCode: string }): Promise<FeeStatusResponse> {
          const res = await fetch(`${apiBase}/api/landing/checkout/check-fee`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });
          return handleResponse<FeeStatusResponse>(res);
        },
        async reserve(payload: ReservationPayload | Record<string, unknown>): Promise<ReservationResponse> {
          const res = await fetch(`${apiBase}/api/landing/checkout/reserve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return handleResponse<ReservationResponse>(res);
        },
        async createStripeSession(payload: StripeSessionPayload | Record<string, unknown>): Promise<CheckoutSessionResponse> {
          const res = await fetch(`${apiBase}/api/landing/checkout/stripe-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return handleResponse<CheckoutSessionResponse>(res);
        },
        async verifyPayment(dto: { sessionId: string; bookingId: string }): Promise<{ success: boolean; booking: BookingRecord }> {
          const res = await fetch(`${apiBase}/api/landing/checkout/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto),
          });
          return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
        },
      },
      bookings: {
        async getById(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
          const res = await fetch(`${apiBase}/api/landing/bookings/${bookingId}`);
          return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
        },
      },
      contact: {
        async submit(payload: ContactFormPayload): Promise<{ success: boolean; message?: string; error?: string; details?: Record<string, string[]> }> {
          const res = await fetch(`${apiBase}/api/landing/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return handleResponse<{ success: boolean; message?: string; error?: string; details?: Record<string, string[]> }>(res);
        },
      },
      settings: {
        async getPaymentGateway(): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
          const res = await fetch(`${apiBase}/api/landing/settings/payment-gateway`);
          return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
        },
      },
    },
    courses: {
      async getCourses(): Promise<{ success: boolean; courses: CourseItem[] }> {
        const res = await fetch(`${apiBase}/api/v1/courses`);
        return handleResponse<{ success: boolean; courses: CourseItem[] }>(res);
      },
      async getCourse(id: string): Promise<{ success: boolean; item?: CourseItem; course?: CourseItem }> {
        const res = await fetch(`${apiBase}/api/v1/courses/${id}`);
        return handleResponse<{ success: boolean; item?: CourseItem; course?: CourseItem }>(res);
      },
    },

    contact: {
      async submit(payload: ContactFormPayload): Promise<{ success: boolean; message?: string }> {
        const res = await fetch(`${apiBase}/api/v1/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return handleResponse<{ success: boolean; message?: string }>(res);
      },
    },

    bookings: {
      async getDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
        const res = await fetch(`${apiBase}/api/v1/bookings/${bookingId}`);
        return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
      },
    },

    settings: {
      async getPaymentGateway(): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
        const res = await fetch(`${apiBase}/api/v1/settings/payment-gateway`);
        return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
      },
      async updatePaymentGateway(data: { stripeEnabled: boolean }): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
        const res = await fetch(`${apiBase}/api/v1/settings/payment-gateway`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
      },
    },

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
        const res = await fetch(`${apiBase}/api/v1/checkout/stripe-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return handleResponse<CheckoutSessionResponse>(res);
      },

      async getItem(itemId: string): Promise<{ success: boolean; item: CourseItem }> {
        const res = await fetch(`${apiBase}/api/v1/courses/${itemId}`);
        return handleResponse<{ success: boolean; item: CourseItem }>(res);
      },

      async getBookingDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
        const res = await fetch(`${apiBase}/api/v1/bookings/${bookingId}`);
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

      async getSettings(): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
        const res = await fetch(`${apiBase}/api/v1/settings/payment-gateway`);
        return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
      },

      async updateSettings(data: { stripeEnabled: boolean }): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
        const res = await fetch(`${apiBase}/api/v1/settings/payment-gateway`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
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
        const res = await fetch(`${apiBase}/api/v1/courses`);
        return handleResponse<{ success: boolean; courses: CourseItem[] }>(res);
      },
    },
  };
}
