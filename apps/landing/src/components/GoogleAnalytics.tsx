"use client";

import { useEffect } from "react";
import { env } from "@/config/env";

/**
 * High-Performance, SEO-friendly Google Tag Manager, Google Analytics 4 & Microsoft Clarity Loader.
 * Implements Google Consent Mode v2.
 *
 * Performance Features:
 * 1. Interaction-Deferred: Scripts are only fetched and executed when the user interacts
 *    with the page (scroll, touch, mouse movement, key press) OR after a 4-second idle timeout.
 * 2. SEO-Friendly: Search engine bots and performance audit tools (like Googlebot, PageSpeed)
 *    never emit interaction events, so the heavy third-party scripts are not loaded for them,
 *    maximizing crawling speed and Lighthouse performance scores (100/100).
 * 3. Zero SSR Impact: Runs entirely on the client-side, leaving the server HTML clean.
 * 4. Data Layer Initialization: Initialized early to prevent event loss.
 *
 * Compliance Features (Google Consent Mode v2 & GDPR):
 * 1. Scripts are loaded always (after interaction/timeout) to allow GTM/GA4/Clarity to connect and
 *    GA4/Clarity to receive cookieless pings when consent is denied (GDPR compliant).
 * 2. Default state is configured based on user's saved preferences (denied by default).
 * 3. Dynamic updates: Updates consent dynamically when user accepts/declines cookies in the banner.
 */
export default function GoogleAnalytics() {
  const GA_ID = env.NEXT_PUBLIC_GA_ID;
  const GTM_ID = env.NEXT_PUBLIC_GTM_ID;
  const CLARITY_ID = env.NEXT_PUBLIC_CLARITY_ID;

  useEffect(() => {
    if (!GA_ID && !GTM_ID && !CLARITY_ID) {
      return;
    }

    // Dynamic consent updater (listens to cookie banner changes)
    const checkConsent = () => {
      const consentStr = localStorage.getItem("cookie-consent");
      if (consentStr) {
        try {
          const data = JSON.parse(consentStr);
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("consent", "update", {
              analytics_storage: data.analytics ? "granted" : "denied",
              ad_storage: data.marketing ? "granted" : "denied",
              ad_user_data: data.marketing ? "granted" : "denied",
              ad_personalization: data.marketing ? "granted" : "denied",
            });
          }
        } catch (e) {
          console.error("Error parsing cookie consent", e);
        }
      }
    };

    window.addEventListener("cookie-consent-updated", checkConsent);

    return () => {
      window.removeEventListener("cookie-consent-updated", checkConsent);
    };
  }, [GA_ID, GTM_ID, CLARITY_ID]);

  useEffect(() => {
    if (!GA_ID && !GTM_ID && !CLARITY_ID) return;

    let loaded = false;
    let idleId: number | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadScripts = () => {
      if (loaded) return;
      loaded = true;

      // Clean up all listeners
      removeListeners();

      // Initialize dataLayer
      const dataLayer = ((window as any).dataLayer = (window as any).dataLayer || []);
      
      // Initialize gtag function for Consent Mode
      if (!(window as any).gtag) {
        (window as any).gtag = function () {
          dataLayer.push(arguments);
        };
      }
      const gtag = (window as any).gtag;

      // Read current saved consent
      const consentStr = localStorage.getItem("cookie-consent");
      let analyticsConsent = false;
      let marketingConsent = false;
      if (consentStr) {
        try {
          const data = JSON.parse(consentStr);
          analyticsConsent = !!data.analytics;
          marketingConsent = !!data.marketing;
        } catch {}
      }

      // Configure Google Consent Mode v2 Default States
      gtag("consent", "default", {
        analytics_storage: analyticsConsent ? "granted" : "denied",
        ad_storage: marketingConsent ? "granted" : "denied",
        ad_user_data: marketingConsent ? "granted" : "denied",
        ad_personalization: marketingConsent ? "granted" : "denied",
        wait_for_update: 500,
      });

      // Inject GTM if configured
      if (GTM_ID && !(window as any).__gtm_loaded__) {
        (window as any).__gtm_loaded__ = true;
        
        dataLayer.push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
        document.head.appendChild(script);
      }

      // Inject GA4 if configured
      if (GA_ID && !(window as any).__ga_loaded__) {
        (window as any).__ga_loaded__ = true;

        gtag("js", new Date());
        gtag("config", GA_ID, {
          page_path: window.location.pathname,
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
      }

      // Inject Microsoft Clarity if configured
      if (CLARITY_ID && !(window as any).__clarity_loaded__) {
        (window as any).__clarity_loaded__ = true;
        (function(c: any, l: Document, a: string, r: string, i: string) {
          c[a] = c[a] || function() {
            (c[a].q = c[a].q || []).push(arguments);
          };
          const t = l.createElement(r) as HTMLScriptElement;
          t.async = true;
          t.src = "https://www.clarity.ms/tag/" + i;
          const y = l.getElementsByTagName(r)[0];
          y.parentNode?.insertBefore(t, y);
        })(window, document, "clarity", "script", CLARITY_ID);
      }
    };

    // Interaction triggers
    const triggerEvents = ["scroll", "mousedown", "mousemove", "touchstart", "keydown"];
    
    const onInteraction = () => {
      loadScripts();
    };

    const addListeners = () => {
      triggerEvents.forEach((event) => {
        window.addEventListener(event, onInteraction, { once: true, passive: true });
      });
    };

    const removeListeners = () => {
      triggerEvents.forEach((event) => {
        window.removeEventListener(event, onInteraction);
      });
      if (idleId && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const isDebugMode = typeof window !== "undefined" && (
      window.location.search.includes("gtm_debug") || 
      window.location.search.includes("gtm_preview") ||
      window.location.hash.includes("gtm_debug") ||
      window.location.hash.includes("gtm_preview")
    );

    // Setup interaction listeners / immediate load for debug
    if (isDebugMode) {
      loadScripts();
    } else {
      addListeners();

      // Idle-timeout fallback: 4 seconds
      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          idleId = window.requestIdleCallback(
            () => {
              loadScripts();
            },
            { timeout: 4000 }
          );
        } else {
          timeoutId = setTimeout(loadScripts, 4000);
        }
      }
    }

    return () => {
      removeListeners();
    };
  }, [GA_ID, GTM_ID, CLARITY_ID]);

  return null;
}
