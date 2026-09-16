export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __gtm_loaded__?: boolean;
    __ga_loaded__?: boolean;
    __clarity_loaded__?: boolean;
  }
}
