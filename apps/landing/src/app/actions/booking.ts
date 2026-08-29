"use server";

import { createApiClient } from "@atena/api-client";
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
  } catch (err: any) {
    console.error("fetchCheckoutItemAction error:", err);
    return { success: false, error: err.message || "Failed to fetch checkout item" };
  }
}

export async function fetchCourseAction(courseId: string) {
  return fetchCheckoutItemAction(courseId);
}


export async function checkRegistrationFeeStatusAction(params: {
  taxCode?: string;
  email?: string;
  phone?: string;
}) {
  try {
    const api = getApi();
    const res = await api.checkout.checkFeeStatus(params);
    return {
      success: true,
      annualFeePaid: res.annualFeePaid,
      academicYear: res.academicYear,
      requiresFee: res.requiresFee,
    };
  } catch (err: any) {
    console.error("checkRegistrationFeeStatusAction error:", err);
    return { success: false, annualFeePaid: false, academicYear: "2026/2027", requiresFee: true, error: err.message || "Errore di connessione" };
  }
}

export async function fetchSystemSettingsAction() {
  try {
    const api = getApi();
    const res = await api.checkout.getSettings();
    return { success: true, stripeEnabled: res?.settings?.stripeEnabled ?? false };
  } catch (err: any) {
    console.error("fetchSystemSettingsAction error:", err);
    return { success: false, stripeEnabled: false };
  }
}

export async function updateSystemSettingsAction(stripeEnabled: boolean) {
  try {
    const api = getApi();
    const res = await api.checkout.updateSettings({ stripeEnabled });
    return { success: true, stripeEnabled: res?.settings?.stripeEnabled ?? stripeEnabled };
  } catch (err: any) {
    console.error("updateSystemSettingsAction error:", err);
    return { success: false, error: err.message || "Failed to update settings" };
  }
}


function normalizeReservationPayload(payload: Record<string, unknown> | any) {
  if (!payload) return {} as CreateReservationParams;
  const v = (payload.values || payload) as Record<string, unknown>;
  const isForChild = Boolean(v.isForChild ?? payload.isForChild);

  const firstName = String(v.firstName || payload.firstName || "");
  const lastName = String(v.lastName || payload.lastName || "");
  const email = String(v.email || payload.email || "");
  const phone = String(v.phone || payload.phone || "");
  const purchaserTaxCode = String(v.purchaserTaxCode || v.taxCode || payload.purchaserTaxCode || payload.taxCode || "");
  const studentTaxCode = isForChild 
    ? String(v.taxCode || v.studentTaxCode || payload.taxCode || payload.studentTaxCode || "") 
    : purchaserTaxCode;

  return {
    itemId: String(payload.itemId || payload.id || v.itemId || v.id || ""),
    itemType: String(payload.itemType || payload.type || v.itemType || v.type || "course"),
    date: String(payload.date || payload.dateParam || v.date || v.dateParam || ""),
    time: String(payload.time || payload.timeParam || v.time || v.timeParam || ""),
    firstName,
    lastName,
    email,
    phone,
    isForChild,
    purchaserTaxCode,
    studentFirstName: isForChild ? String(v.studentFirstName || payload.studentFirstName || "") : firstName,
    studentLastName: isForChild ? String(v.studentLastName || payload.studentLastName || "") : lastName,
    studentEmail: isForChild ? String(v.studentEmail || payload.studentEmail || "") : email,
    studentPhone: isForChild ? String(v.studentPhone || payload.studentPhone || "") : phone,
    studentTaxCode,
    studentBirthDate: (v.studentBirthDate || payload.studentBirthDate) ? String(v.studentBirthDate || payload.studentBirthDate) : undefined,
    needsCompanyInvoice: Boolean(v.needsCompanyInvoice ?? payload.needsCompanyInvoice),
    sdiCode: (v.sdiCode || payload.sdiCode) ? String(v.sdiCode || payload.sdiCode) : undefined,
    pecEmail: (v.pecEmail || payload.pecEmail) ? String(v.pecEmail || payload.pecEmail) : undefined,
    includeRegistrationFee: (v.includeRegistrationFee ?? payload.includeRegistrationFee) !== undefined ? Boolean(v.includeRegistrationFee ?? payload.includeRegistrationFee) : undefined,
    notes: String(v.notes || payload.notes || ""),
  } as CreateReservationParams;
}

export async function createOrUpdateReservationServerAction(payload: Record<string, unknown> | any) {
  try {
    const api = getApi();
    const dto = normalizeReservationPayload(payload);
    const res = await api.checkout.createReservation(dto);
    if (res.success && res.booking) {
      return {
        success: true,
        bookingId: res.bookingId,
        booking: res.booking,
      };
    }
    return { success: false, error: "Failed to create reservation" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create reservation";
    console.error("createOrUpdateReservationServerAction error:", err);
    return { success: false, error: errorMsg };
  }
}

export async function initiateStripePaymentAction(payload: Record<string, unknown> | any) {
  try {
    const api = getApi();
    const dto = normalizeReservationPayload(payload);
    const res = await api.checkout.createStripeSession(dto);
    if (res.success && res.url) {
      return { success: true, url: res.url, bookingId: res.bookingId };
    }
    return { success: false, error: "Failed to create Stripe session" };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to initiate Stripe payment";
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
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch booking details" };
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
  } catch (err: any) {
    console.error("dispatchMagicLinkAction exception:", err);
    return { success: false, error: err.message || "Failed to send magic link" };
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
  } catch (err: any) {
    console.error("confirmPaymentAction error:", err);
    return { success: false, booking: { id: bookingId }, error: err.message };
  }
}

export async function mergeGuestBookingsAction(sessionId?: string | null, userId?: string) {
  return { success: true };
}

export async function deleteBookingServerAction(bookingId: string, secondParam?: any) {
  return { success: true, error: null };
}

export async function checkoutCartServerAction(sessionId?: string | null) {
  return { success: true, error: null };
}

export async function getCartCountAction(sessionId?: string | null) {
  return { success: true, count: 0 };
}

export async function fetchCartItemsAction(sessionId?: string | null) {
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

    const feeRes = await checkRegistrationFeeStatusAction({
      email: user.email,
      phone: user.phone || user.user_metadata?.phone,
      taxCode: user.user_metadata?.tax_code,
    });

    return {
      success: true,
      user,
      annualFeePaid: Boolean(feeRes.annualFeePaid),
    };
  } catch (err: any) {
    return { success: false, user: null, annualFeePaid: false };
  }
}
