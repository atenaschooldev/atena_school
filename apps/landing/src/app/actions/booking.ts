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
    return { success: true, annualFeePaid: false, academicYear: "2026/2027", requiresFee: true };
  }
}

export async function createOrUpdateReservationServerAction(payload: any, secondParam?: any, thirdParam?: any) {
  try {
    const api = getApi();
    const res = await api.checkout.createReservation(payload);
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

export async function initiateStripePaymentAction(payload: any, secondParam?: any) {
  try {
    const api = getApi();
    const res = await api.checkout.createStripeSession(payload);
    if (res.success && res.url) {
      return { success: true, url: res.url, bookingId: res.bookingId };
    }
    return { success: false, error: "Failed to create Stripe session" };
  } catch (err: any) {
    console.error("initiateStripePaymentAction error:", err);
    return { success: false, error: err.message || "Failed to initiate Stripe payment" };
  }
}

export async function getBookingDetailsServer(bookingId: string, secondParam?: any) {
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
  return { success: true, error: null };
}

export async function confirmPaymentAction(bookingId: string) {
  return { success: true, booking: { id: bookingId }, error: null };
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
  return { success: false, user: null, error: "Landing is anonymous showcase", annualFeePaid: false };
}
