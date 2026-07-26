"use server";

import { createApiClient } from "@atena/api-client";

const getApi = () => createApiClient();

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

function normalizeReservationPayload(payload: any) {
  if (!payload) return {};
  const v = payload.values || payload;
  const isForChild = Boolean(v.isForChild ?? payload.isForChild);

  const firstName = String(v.firstName || payload.firstName || "");
  const lastName = String(v.lastName || payload.lastName || "");
  const email = String(v.email || payload.email || "");
  const phone = String(v.phone || payload.phone || "");
  const purchaserTaxCode = String(v.purchaserTaxCode || payload.purchaserTaxCode || "");

  return {
    itemId: String(payload.itemId || payload.id || v.itemId || v.id || ""),
    itemType: payload.itemType || payload.type || v.itemType || v.type || "course",
    date: payload.date || payload.dateParam || v.date || v.dateParam || "",
    time: payload.time || payload.timeParam || v.time || v.timeParam || "",
    firstName,
    lastName,
    email,
    phone,
    isForChild,
    purchaserTaxCode,
    studentFirstName: isForChild ? (v.studentFirstName || payload.studentFirstName || "") : firstName,
    studentLastName: isForChild ? (v.studentLastName || payload.studentLastName || "") : lastName,
    studentEmail: isForChild ? (v.studentEmail || payload.studentEmail || "") : email,
    studentPhone: isForChild ? (v.studentPhone || payload.studentPhone || "") : phone,
    studentTaxCode: isForChild ? (v.taxCode || v.studentTaxCode || payload.taxCode || payload.studentTaxCode || "") : purchaserTaxCode,
    studentBirthDate: v.studentBirthDate || payload.studentBirthDate || null,
    needsCompanyInvoice: Boolean(v.needsCompanyInvoice ?? payload.needsCompanyInvoice),
    sdiCode: v.sdiCode || payload.sdiCode || null,
    pecEmail: v.pecEmail || payload.pecEmail || null,
    includeRegistrationFee: v.includeRegistrationFee ?? payload.includeRegistrationFee,
    notes: v.notes || payload.notes || "",
  };
}

export async function createOrUpdateReservationServerAction(payload: any) {
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
  } catch (err: any) {
    console.error("createOrUpdateReservationServerAction error:", err);
    return { success: false, error: err.message || "Failed to create reservation" };
  }
}

export async function initiateStripePaymentAction(payload: any) {
  try {
    const api = getApi();
    const dto = normalizeReservationPayload(payload);
    const res = await api.checkout.createStripeSession(dto);
    if (res.success && res.url) {
      return { success: true, url: res.url, bookingId: res.bookingId };
    }
    return { success: false, error: "Failed to create Stripe session" };
  } catch (err: any) {
    console.error("initiateStripePaymentAction error:", err);
    return { success: false, error: err.message || "Failed to initiate Stripe payment" };
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
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    
    // Find Supabase JWT token from cookies
    const allCookies = cookieStore.getAll();
    let token = "";
    for (const c of allCookies) {
      if (c.name.includes("auth-token") || c.name.includes("access-token")) {
        try {
          const parsed = JSON.parse(c.value);
          token = parsed.access_token || parsed[0]?.access_token || c.value;
          if (token) break;
        } catch {
          token = c.value;
        }
      }
    }

    if (!token) {
      return { success: false, user: null, annualFeePaid: false };
    }

    const api = getApi();
    const res = (await api.portal.getDashboard(token)) as any;

    if (res?.success && res?.user) {
      return {
        success: true,
        user: res.user,
        annualFeePaid: Boolean(res.user?.annualFeePaid || res.annualFeePaid),
      };
    }
    return { success: false, user: null, annualFeePaid: false };
  } catch (err: any) {
    return { success: false, user: null, error: err.message, annualFeePaid: false };
  }
}
