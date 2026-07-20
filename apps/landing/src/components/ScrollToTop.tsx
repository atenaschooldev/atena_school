"use client";

import { useEffect, useState } from "react";
import { CaretUp } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

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

  if (pathname && (pathname.includes("/checkout") || pathname.includes("/book"))) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#00328F] text-white shadow-lg border border-white/10 hover:bg-[#FAA904] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <CaretUp className="w-5 h-5" weight="bold" />
      </button>
    </>
  );
};

export default ScrollToTop;
