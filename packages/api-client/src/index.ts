import type {
  FeeStatusResponse,
  ReservationResponse,
  CheckoutSessionResponse,
  SiteContentResponse,
  CourseItem,
  BookingRecord,
  ErrorCode,
} from "@atena/api-types";

declare const process: { env?: Record<string, string | undefined> } | undefined;

export class ApiError extends Error {
  public status?: number;
  public code?: ErrorCode | number;
  public details?: Record<string, string[]>;

  constructor(message: string, status?: number, code?: ErrorCode | number, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.message || errData?.error || `API Error: ${res.status} ${res.statusText}`;
    const code = errData?.code || errData?.error_code || errData?.errorCode;
    const details = errData?.details;
    throw new ApiError(message, res.status, code, details);
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
  notes?: string;
  paymentStatus?: number;
  paymentMethod?: number;
  idempotencyKey?: string;
  students?: Array<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    taxCode: string;
    birthDate: string;
  }>;
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
  privacy?: boolean;
}

export interface ApiClientConfig {
  baseUrl?: string;
  mode?: "nest" | "vercel" | "auto";
}

export function createApiClient(config?: string | ApiClientConfig) {
  const options: ApiClientConfig = typeof config === "string" ? { baseUrl: config } : config || {};
  const envUrl = typeof process !== "undefined" && process?.env ? process.env.NEXT_PUBLIC_BACKEND_URL : undefined;
  const isBrowser = typeof window !== "undefined";

  const rawBase = options.baseUrl !== undefined
    ? options.baseUrl
    : (envUrl !== undefined
        ? envUrl
        : (isBrowser ? "" : "http://localhost:4000"));

  const baseUrl = (rawBase || "").replace(/\/+$/, "");

  // Determine mode: if baseUrl points to external backend or mode is 'nest'
  const isNest = options.mode === "nest" || (options.mode !== "vercel" && (
    baseUrl.includes(":4000") ||
    baseUrl.includes("/api/v1") ||
    (baseUrl.startsWith("http") && !baseUrl.includes(typeof window !== "undefined" ? window.location.host : ""))
  ));

  const prefix = isNest ? `${baseUrl}/api/v1` : (baseUrl ? `${baseUrl}/api/landing` : "/api/landing");

  const coursesService = {
    async getAll(): Promise<{ success: boolean; courses: CourseItem[] }> {
      const res = await fetch(`${prefix}/courses`);
      return handleResponse<{ success: boolean; courses: CourseItem[] }>(res);
    },
    async getCourses(): Promise<{ success: boolean; courses: CourseItem[] }> {
      return coursesService.getAll();
    },
    async getById(id: string): Promise<{ success: boolean; item?: CourseItem; course?: CourseItem }> {
      const res = await fetch(`${prefix}/courses/${id}`);
      return handleResponse<{ success: boolean; item?: CourseItem; course?: CourseItem }>(res);
    },
    async getCourse(id: string): Promise<{ success: boolean; item?: CourseItem; course?: CourseItem }> {
      return coursesService.getById(id);
    },
  };

  const checkoutService = {
    async checkFee(params: { taxCode: string }): Promise<FeeStatusResponse> {
      const res = await fetch(`${prefix}/checkout/check-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return handleResponse<FeeStatusResponse>(res);
    },
    async checkFeeStatus(params: { taxCode?: string; email?: string; phone?: string }): Promise<FeeStatusResponse> {
      const res = await fetch(`${prefix}/checkout/check-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return handleResponse<FeeStatusResponse>(res);
    },
    async reserve(payload: ReservationPayload | Record<string, unknown>): Promise<ReservationResponse> {
      const res = await fetch(`${prefix}/checkout/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return handleResponse<ReservationResponse>(res);
    },
    async createReservation(payload: ReservationPayload | Record<string, unknown>): Promise<ReservationResponse> {
      return checkoutService.reserve(payload);
    },
    async createStripeSession(payload: StripeSessionPayload | Record<string, unknown>): Promise<CheckoutSessionResponse> {
      const res = await fetch(`${prefix}/checkout/stripe-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return handleResponse<CheckoutSessionResponse>(res);
    },
    async verifyPayment(dto: { sessionId: string; bookingId: string }): Promise<{ success: boolean; booking: BookingRecord }> {
      const res = await fetch(`${prefix}/checkout/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
    },
    async getItem(itemId: string): Promise<{ success: boolean; item: CourseItem }> {
      const res = await fetch(`${prefix}/courses/${itemId}`);
      return handleResponse<{ success: boolean; item: CourseItem }>(res);
    },
    async getBookingDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
      const res = await fetch(`${prefix}/bookings/${bookingId}`);
      return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
    },
    async getSettings(): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
      const res = await fetch(`${prefix}/settings/payment-gateway`);
      return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
    },
    async updateSettings(data: { stripeEnabled: boolean }): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
      const res = await fetch(`${prefix}/settings/payment-gateway`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
    },
  };

  const bookingsService = {
    async getById(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
      const res = await fetch(`${prefix}/bookings/${bookingId}`);
      return handleResponse<{ success: boolean; booking: BookingRecord }>(res);
    },
    async getDetails(bookingId: string): Promise<{ success: boolean; booking: BookingRecord }> {
      return bookingsService.getById(bookingId);
    },
  };

  const contactService = {
    async submit(payload: ContactFormPayload): Promise<{ success: boolean; message?: string; error?: string; details?: Record<string, string[]> }> {
      const res = await fetch(`${prefix}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return handleResponse<{ success: boolean; message?: string; error?: string; details?: Record<string, string[]> }>(res);
    },
  };

  const settingsService = {
    async getPaymentGateway(): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
      const res = await fetch(`${prefix}/settings/payment-gateway`);
      return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
    },
    async updatePaymentGateway(data: { stripeEnabled: boolean }): Promise<{ success: boolean; settings: { stripeEnabled: boolean } }> {
      const res = await fetch(`${prefix}/settings/payment-gateway`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; settings: { stripeEnabled: boolean } }>(res);
    },
  };

  const portalService = {
    async getDashboard(token: string) {
      const res = await fetch(`${prefix}/portal/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return handleResponse(res);
    },
    async updateProfile(token: string, data: { profileName: string; profilePhone: string }) {
      const res = await fetch(`${prefix}/portal/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  };

  return {
    prefix,
    isNest,
    courses: coursesService,
    checkout: checkoutService,
    bookings: bookingsService,
    contact: contactService,
    settings: settingsService,
    portal: portalService,
    cms: {
      async getCourses(): Promise<{ success: boolean; courses: CourseItem[] }> {
        return coursesService.getAll();
      },
    },
    landing: {
      courses: coursesService,
      checkout: checkoutService,
      bookings: bookingsService,
      contact: contactService,
      settings: settingsService,
    },
  };
}
