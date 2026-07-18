"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AosInitializer() {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
      offset: 50,
      delay: 50,
    });

    // Refresh AOS once layout is fully rendered
    const handleLoad = () => {
      AOS.refresh();
    };

    window.addEventListener("load", handleLoad);
    
    // Fallback refresh for React hydration & Next.js chunk loading
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 200);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
