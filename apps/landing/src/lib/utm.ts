/**
 * Utility for capturing and retrieving UTM and marketing attribution parameters.
 * Stores attribution data in localStorage on first landing page hit.
 */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  captured_at?: string;
}

const STORAGE_KEY = "atena_utm_attribution";

export function captureUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const keys: (keyof UtmParams)[] = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "fbclid",
    ];

    const currentParams: UtmParams = {};
    let hasUtm = false;

    keys.forEach((key) => {
      const val = urlParams.get(key);
      if (val) {
        currentParams[key] = val;
        hasUtm = true;
      }
    });

    if (hasUtm) {
      currentParams.captured_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentParams));
      return currentParams;
    }
  } catch (e) {
    console.error("Failed to capture UTM params:", e);
  }

  return getStoredUtmParams();
}

export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UtmParams;
    }
  } catch {
    return null;
  }

  return null;
}
