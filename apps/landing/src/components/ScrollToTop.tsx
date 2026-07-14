"use client";

import { useEffect, useState } from "react";
import { CaretUp } from "@phosphor-icons/react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#043569] text-white shadow-lg border border-white/10 hover:bg-[#F8861D] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <CaretUp className="w-5 h-5" weight="bold" />
    </button>
  );
};

export default ScrollToTop;
