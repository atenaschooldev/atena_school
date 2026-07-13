"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    // Initial check
    const checkConsent = () => {
      const consentStr = localStorage.getItem("cookie-consent");
      if (consentStr) {
        try {
          const data = JSON.parse(consentStr);
          setConsent({
            analytics: !!data.analytics,
            marketing: !!data.marketing,
          });

          // Update gtag consent mode
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
              'analytics_storage': data.analytics ? 'granted' : 'denied',
              'ad_storage': data.marketing ? 'granted' : 'denied',
            });
          }
        } catch (e) {
          console.error("Error parsing cookie consent", e);
        }
      }
    };

    checkConsent();
    window.addEventListener("cookie-consent-updated", checkConsent);
    return () => window.removeEventListener("cookie-consent-updated", checkConsent);
  }, []);

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return null;
  }

  // Strictly adhere to GDPR by completely withholding script execution
  // until explicit consent for analytics is granted
  if (!consent.analytics) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Since we only load when consent is given, it's granted
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': '${consent.marketing ? "granted" : "denied"}',
              'wait_for_update': 500
            });

            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
