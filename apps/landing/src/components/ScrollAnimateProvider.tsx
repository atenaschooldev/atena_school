"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Optimize performance on mobile by ignoring address bar resizing triggers
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
    // Only enable smooth scrolling on desktop devices and if the user doesn't prefer reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isTouch && !prefersReducedMotion) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Sync Lenis with GSAP ticker for perfect scroll animation synchronization
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Initial ScrollTrigger refresh after Lenis initialization
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      // Ensure all elements are 100% visible if animations are disabled
      document.querySelectorAll("[data-gsap]").forEach((el) => {
        gsap.set(el, { clearProps: "all" });
      });
      return;
    }

    // Function to initialize GSAP animation for elements
    const initAnimations = () => {
      const elements = document.querySelectorAll("[data-gsap]");
      if (elements.length === 0) return;

      elements.forEach((el) => {
        if (el.classList.contains("gsap-init")) {
          // If already initialized (e.g. back navigation), ensure element is fully visible
          gsap.set(el, { opacity: 1, y: 0 });
          return;
        }

        el.classList.add("gsap-init");

        const animationType = el.getAttribute("data-gsap") || "fade-up";
        const delayStr = el.getAttribute("data-gsap-delay") || "0";
        const delay = parseFloat(delayStr) / 1000;
        
        // Default duration is 500ms for snappier entry animations
        const durationStr = el.getAttribute("data-gsap-duration") || "500";
        const duration = parseFloat(durationStr) / 1000;

        const initialVars: gsap.TweenVars = {
          opacity: 0,
        };
        const animVars: gsap.TweenVars = {
          opacity: 1,
          duration: duration,
          delay: delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 95%", // Trigger earlier when element enters near the bottom of screen (95% from top)
            toggleActions: "play none none none",
          },
        };

        if (animationType === "fade-up") {
          initialVars.y = 20; // Reduced shift distance for a faster, tighter feel
          animVars.y = 0;
        } else if (animationType === "fade-in") {
          // Just opacity
        }

        // Set initial states and create tween
        gsap.set(el, initialVars);
        gsap.to(el, animVars);
      });

      ScrollTrigger.refresh();
    };

    // Run animation initialization once on route change
    const timer = setTimeout(initAnimations, 100);

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        document.querySelectorAll("[data-gsap]").forEach((el) => {
          gsap.set(el, { clearProps: "all" });
          el.classList.remove("gsap-init");
        });
        initAnimations();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pageshow", handlePageShow);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      document.querySelectorAll("[data-gsap]").forEach((el) => {
        gsap.set(el, { clearProps: "all" });
        el.classList.remove("gsap-init");
      });
    };
  }, [pathname, enabled]);

  if (enabled) {
    return (
      <ReactLenis
        root
        ref={lenisRef}
        options={{
          lerp: 0.1,
          duration: 1.2,
          syncTouch: false, // Use native touch scrolling on mobile to keep high performance and standard inertial scroll feel
          autoRaf: false, // Drive it via GSAP ticker
        }}
      >
        {children}
      </ReactLenis>
    );
  }

  return <>{children}</>;
}
