import type {
  FeeStatusResponse,
  ReservationResponse,
  CheckoutSessionResponse,
  SiteContentResponse,
  CourseItem,
  BookingRecord,
} from "@atena/api-types";

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
        return res.json();
      },

      async createReservation(payload: any): Promise<ReservationResponse> {
        const res = await fetch(`${apiBase}/api/v1/checkout/reserve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res.json();
      },

      async createStripeSession(payload: any): Promise<CheckoutSessionResponse> {
        const res = await fetch(`${apiBase}/api/v1/checkout/create-stripe-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res.json();
      },

      async getItem(itemId: string): Promise<{ success: boolean; item: CourseItem }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/item/${itemId}`);
        return res.json();
      },

      async getBookingDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/booking-details/${bookingId}`);
        return res.json();
      },
    },

    portal: {
      async getDashboard(token: string) {
        const res = await fetch(`${apiBase}/api/v1/portal/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
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
        return res.json();
      },
    },

    cms: {
      async getCourses(): Promise<{ success: boolean; courses: CourseItem[] }> {
        const res = await fetch(`${apiBase}/api/v1/checkout/courses`);
        return res.json();
      },
    },
  };
}
