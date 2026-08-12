"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Ignore mobile address bar resize height triggers to eliminate layout thrashing
ScrollTrigger.config({ ignoreMobileResize: true });

export default function ScrollAnimateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Enable smooth Lenis scrolling only on desktop devices with fine pointers
    const isMobileDevice = window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobileDevice && !prefersReducedMotion) {
      setEnabled(true);
    }
  }, []);

  // Sync Lenis smooth scroll ticker with GSAP
  useEffect(() => {
    if (!enabled) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
    };
  }, [enabled]);

  // GSAP Responsive MatchMedia & Context Setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px) and (pointer: fine)",
          isMobile: "(max-width: 1023px), (pointer: coarse)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, reduceMotion } = context.conditions as any;

          // 1. Reduced motion preference -> clear all inline styles immediately
          if (reduceMotion) {
            gsap.set("[data-gsap]", { clearProps: "all", opacity: 1, y: 0 });
            return;
          }

          // 2. Mobile devices: Snappy, lightweight fade-in without heavy shifts or jank
          if (isMobile) {
            const elements = gsap.utils.toArray<HTMLElement>("[data-gsap]");
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { autoAlpha: 0, y: 10 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.35,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 95%",
                    once: true,
                  },
                }
              );
            });
          }

          // 3. Desktop: Smooth premium animations with custom delays
          if (isDesktop) {
            const elements = gsap.utils.toArray<HTMLElement>("[data-gsap]");
            elements.forEach((el) => {
              const animationType = el.getAttribute("data-gsap") || "fade-up";
              const delayStr = el.getAttribute("data-gsap-delay") || "0";
              const delay = parseFloat(delayStr) / 1000;
              const durationStr = el.getAttribute("data-gsap-duration") || "500";
              const duration = parseFloat(durationStr) / 1000;

              const initialY = animationType === "fade-up" ? 20 : 0;

              gsap.fromTo(
                el,
                { autoAlpha: 0, y: initialY },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration,
                  delay,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    once: true,
                  },
                }
              );
            });
          }
        }
      );
    });

    // Refresh ScrollTrigger after DOM renders
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert(); // GSAP Context Revert cleanly cleans up all matchMedia and ScrollTrigger instances
    };
  }, [pathname]);

  if (enabled) {
    return (
      <ReactLenis
        root
        ref={lenisRef}
        options={{
          lerp: 0.1,
          duration: 1.2,
          syncTouch: false,
          autoRaf: false,
        }}
      >
        {children}
      </ReactLenis>
    );
  }

  return <>{children}</>;
}
