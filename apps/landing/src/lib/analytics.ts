/**
 * Standardized analytics tracker for GA4, GTM, and Google Consent Mode v2.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type AnalyticsEvent =
  | "generate_lead"
  | "begin_checkout"
  | "purchase"
  | "contact_form_view"
  | "test_english_completed";

export interface EventParams {
  [key: string]: any;
}

export function trackEvent(eventName: AnalyticsEvent | string, params?: EventParams) {
  if (typeof window === "undefined") return;

  try {
    // 1. Send via gtag if available
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }

    // 2. Push to dataLayer for GTM
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  } catch (error) {
    console.warn("Analytics trackEvent error:", error);
  }
}
