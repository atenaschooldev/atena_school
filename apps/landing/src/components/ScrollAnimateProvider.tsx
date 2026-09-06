"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Ignore mobile address bar resize height triggers
ScrollTrigger.config({ ignoreMobileResize: true });

export default function ScrollAnimateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const isHistoryNavigation = useRef(false);

  useEffect(() => {
    // Only enable Lenis smooth scrolling on desktop devices with fine pointers and motion enabled
    const isMobileDevice = window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobileDevice && !prefersReducedMotion) {
      setEnabled(true);
    }

    // Configure manual scroll restoration to avoid browser jumps
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const handlePopState = () => {
      isHistoryNavigation.current = true;
    };

    const saveCurrentScroll = () => {
      if (typeof window === "undefined") return;
      const currentY = lenisRef.current?.lenis?.scroll ?? window.scrollY;
      const currentPath = window.location.pathname + window.location.search;
      if (currentY > 0) {
        sessionStorage.setItem(`atena_scroll_${currentPath}`, currentY.toString());
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveCurrentScroll, 150);
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (target) {
        saveCurrentScroll();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", saveCurrentScroll);
    document.addEventListener("click", handleClick, { capture: true, passive: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", saveCurrentScroll);
      document.removeEventListener("click", handleClick, { capture: true });
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Handle Scroll Restoration on Route / History Change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentPath = window.location.pathname + window.location.search;
    const hash = window.location.hash;

    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          if (lenisRef.current?.lenis) {
            lenisRef.current.lenis.scrollTo(el as HTMLElement, { immediate: true });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 80);
      }
      isHistoryNavigation.current = false;
      return;
    }

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      const savedYStr = sessionStorage.getItem(`atena_scroll_${currentPath}`);
      if (savedYStr) {
        const savedY = parseFloat(savedYStr);
        if (!isNaN(savedY) && savedY > 0) {
          const restoreScroll = () => {
            if (lenisRef.current?.lenis) {
              lenisRef.current.lenis.scrollTo(savedY, { immediate: true });
            }
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, savedY);
            document.documentElement.style.scrollBehavior = originalScrollBehavior;
          };

          // Apply at multiple lifecycle stages to ensure GSAP and layout render without jumping
          restoreScroll();
          requestAnimationFrame(restoreScroll);
          const t1 = setTimeout(restoreScroll, 50);
          const t2 = setTimeout(restoreScroll, 150);
          const t3 = setTimeout(restoreScroll, 300);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
          };
        }
      }
    } else {
      // Normal forward navigation to new page -> start at top
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }
  }, [pathname]);

  // Synchronize Lenis smooth scroll ticker with GSAP ticker & ScrollTrigger
  useEffect(() => {
    if (!enabled) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Sync ScrollTrigger updates with Lenis scroll events
    const lenisInstance = lenisRef.current?.lenis;
    if (lenisInstance) {
      lenisInstance.on("scroll", ScrollTrigger.update);
    }

    return () => {
      gsap.ticker.remove(update);
      lenisInstance?.off("scroll", ScrollTrigger.update);
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
          smoothWheel: true,
          autoRaf: false, // Driven via GSAP ticker
        }}
      >
        {children}
      </ReactLenis>
    );
  }

  return <>{children}</>;
}
