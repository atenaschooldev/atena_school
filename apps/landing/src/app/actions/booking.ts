"use server";

import { createApiClient } from "@atena/api-client";
import { checkFeeSchema, createReservationSchema } from "@atena/validators";
import type { CreateReservationParams } from "@/lib/server/checkout-service";

const getApi = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || siteUrl;
  return createApiClient(backendUrl);
};

export async function fetchCheckoutItemAction(itemId: string) {
  try {
    const api = getApi();
    const res = await api.checkout.getItem(itemId);
    if (res.success && res.item) {
      return { success: true, item: res.item, course: res.item };
    }
    return { success: false, error: "Item not found" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch checkout item";
    console.error("fetchCheckoutItemAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function fetchCourseAction(courseId: string) {
  return fetchCheckoutItemAction(courseId);
}


export async function checkRegistrationFeeStatusAction(params: {
  taxCode: string;
}) {
  const parsed = checkFeeSchema.safeParse(params);
  if (!parsed.success) {
    return {
      success: false,
      annualFeePaid: false,
      academicYear: "2026/2027",
      requiresFee: true,
      error: "Codice Fiscale non valido",
    };
  }

  try {
    const api = getApi();
    const res = await api.checkout.checkFeeStatus(parsed.data);
    return {
      success: true,
      annualFeePaid: res.annualFeePaid,
      academicYear: res.academicYear,
      requiresFee: res.requiresFee,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Errore di connessione";
    console.error("checkRegistrationFeeStatusAction error:", err);
    return { success: false, annualFeePaid: false, academicYear: "2026/2027", requiresFee: true, error: errorMsg };
  }
}

export async function fetchSystemSettingsAction() {
  try {
    const api = getApi();
    const res = await api.checkout.getSettings();
    return { success: true, stripeEnabled: res?.settings?.stripeEnabled ?? false };
  } catch (err: unknown) {
    console.error("fetchSystemSettingsAction error:", err);
    return { success: false, stripeEnabled: false };
  }
}

export async function updateSystemSettingsAction(stripeEnabled: boolean) {
  try {
    const api = getApi();
    const res = await api.checkout.updateSettings({ stripeEnabled });
    return { success: true, stripeEnabled: res?.settings?.stripeEnabled ?? stripeEnabled };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update settings";
    console.error("updateSystemSettingsAction error:", err);
    return { success: false, error: errorMsg };
  }
}


function normalizeReservationPayload(payload: Record<string, unknown> | any) {
  if (!payload) return {} as CreateReservationParams;
  const v = (payload.values || payload) as Record<string, unknown>;
  const isForChild = Boolean(v.isForChild ?? payload.isForChild);

  const firstName = String(v.firstName || payload.firstName || "").trim();
  const lastName = String(v.lastName || payload.lastName || "").trim();
  const email = String(v.email || payload.email || "").trim().toLowerCase();
  const phone = String(v.phone || payload.phone || "").trim();
  const purchaserTaxCode = String(v.purchaserTaxCode || v.taxCode || payload.purchaserTaxCode || payload.taxCode || "").trim().toUpperCase();
  const studentTaxCode = isForChild 
    ? String(v.taxCode || v.studentTaxCode || payload.taxCode || payload.studentTaxCode || "").trim().toUpperCase() 
    : purchaserTaxCode;

  const students = Array.isArray(v.students || payload.students)
    ? (v.students || payload.students).map((s: any) => ({
        firstName: String(s.firstName || "").trim(),
        lastName: String(s.lastName || "").trim(),
        email: s.email ? String(s.email).trim().toLowerCase() : undefined,
        phone: s.phone ? String(s.phone).trim() : undefined,
        taxCode: String(s.taxCode || s.studentTaxCode || "").trim().toUpperCase(),
        birthDate: s.birthDate ? String(s.birthDate).trim() : undefined,
      }))
    : undefined;

  return {
    itemId: String(payload.itemId || payload.id || v.itemId || v.id || "").trim(),
    itemType: String(payload.itemType || payload.type || v.itemType || v.type || "course").trim(),
    date: String(payload.date || payload.dateParam || v.date || v.dateParam || "").trim(),
    time: String(payload.time || payload.timeParam || v.time || v.timeParam || "").trim(),
    firstName,
    lastName,
    email,
    phone,
    isForChild,
    purchaserTaxCode,
    students,
    studentFirstName: isForChild ? String(v.studentFirstName || payload.studentFirstName || "").trim() : firstName,
    studentLastName: isForChild ? String(v.studentLastName || payload.studentLastName || "").trim() : lastName,
    studentEmail: isForChild ? String(v.studentEmail || payload.studentEmail || "").trim().toLowerCase() : email,
    studentPhone: isForChild ? String(v.studentPhone || payload.studentPhone || "").trim() : phone,
    studentTaxCode,
    studentBirthDate: (v.studentBirthDate || payload.studentBirthDate) ? String(v.studentBirthDate || payload.studentBirthDate).trim() : undefined,
    needsCompanyInvoice: Boolean(v.needsCompanyInvoice ?? payload.needsCompanyInvoice),
    sdiCode: (v.sdiCode || payload.sdiCode) ? String(v.sdiCode || payload.sdiCode).trim().toUpperCase() : undefined,
    pecEmail: (v.pecEmail || payload.pecEmail) ? String(v.pecEmail || payload.pecEmail).trim().toLowerCase() : undefined,
    includeRegistrationFee: (v.includeRegistrationFee ?? payload.includeRegistrationFee) !== undefined ? Boolean(v.includeRegistrationFee ?? payload.includeRegistrationFee) : undefined,
    notes: String(v.notes || payload.notes || "").trim(),
  } as CreateReservationParams;
}

export async function createOrUpdateReservationServerAction(payload: Record<string, unknown> | any) {
  try {
    const dto = normalizeReservationPayload(payload);
    const parsed = createReservationSchema.safeParse(dto);
    if (!parsed.success) {
      return {
        success: false,
        error: "Dati di prenotazione non validi",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    const api = getApi();
    const res = await api.checkout.createReservation(parsed.data as any);
    if (res.success && res.booking) {
      return {
        success: true,
        bookingId: res.bookingId,
        booking: res.booking,
      };
    }
    return { success: false, error: (res as any).error || "Failed to create reservation" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create reservation";
    console.error("createOrUpdateReservationServerAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function initiateStripePaymentAction(payload: Record<string, unknown> | any) {
  try {
    const dto = normalizeReservationPayload(payload);
    const parsed = createReservationSchema.safeParse(dto);
    if (!parsed.success) {
      return {
        success: false,
        error: "Dati di prenotazione non validi",
        details: parsed.error.flatten().fieldErrors,
      };
    }

    const api = getApi();
    const res = await api.checkout.createStripeSession(parsed.data as any);
    if (res.success && res.url) {
      return { success: true, url: res.url, bookingId: res.bookingId };
    }
    return { success: false, error: (res as any).error || "Failed to create Stripe session" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create Stripe session";
    console.error("initiateStripePaymentAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function getBookingDetailsServer(bookingId: string) {
  try {
    const api = getApi();
    const res = await api.checkout.getBookingDetails(bookingId);
    if (res.success && res.booking) {
      const b: any = res.booking;
      return {
        success: true,
        booking: b,
        data: b,
        item_name: b.course_name || b.item_title,
        item_teacher: b.teacher_name || "Atena School",
      };
    }
    return { success: false, error: "Booking not found" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch booking details";
    return { success: false, error: errorMsg };
  }
}

export async function dispatchMagicLinkAction(email: string) {
  try {
    if (!email) return { success: false, error: "Email non valida" };
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atena-school.vercel.app";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/autenticazione/callback`,
      },
    });
    if (error) {
      console.error("dispatchMagicLinkAction error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send magic link";
    console.error("dispatchMagicLinkAction exception:", err);
    return { success: false, error: errorMsg };
  }
}

export async function confirmPaymentAction(bookingId: string, sessionId?: string) {
  try {
    if (sessionId && bookingId) {
      const api = getApi();
      const res = await api.checkout.verifyPayment({ sessionId, bookingId });
      return { success: res.success, booking: res.booking, error: null };
    }
    return { success: true, booking: { id: bookingId }, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Payment confirmation failed";
    console.error("confirmPaymentAction error:", err);
    return { success: false, booking: { id: bookingId }, error: errorMsg };
  }
}

export async function mergeGuestBookingsAction(_sessionId?: string | null, _userId?: string) {
  return { success: true };
}

export async function deleteBookingServerAction(_bookingId: string, _secondParam?: unknown) {
  return { success: true, error: null };
}

export async function checkoutCartServerAction(_sessionId?: string | null) {
  return { success: true, error: null };
}

export async function getCartCountAction(_sessionId?: string | null) {
  return { success: true, count: 0 };
}

export async function fetchCartItemsAction(_sessionId?: string | null) {
  return { success: true, bookings: [], error: null };
}

export async function getCurrentUserAction() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, user: null, annualFeePaid: false };
    }

    const taxCode = user.user_metadata?.tax_code;
    const feeRes = taxCode
      ? await checkRegistrationFeeStatusAction({ taxCode })
      : { success: false, annualFeePaid: false };

    return {
      success: true,
      user,
      annualFeePaid: Boolean(feeRes.annualFeePaid),
    };
  } catch {
    return { success: false, user: null, annualFeePaid: false };
  }
}
