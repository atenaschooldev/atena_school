"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);

    setProgress(15);
    setVisible(true);

    // Smooth trickle effect
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const inc = Math.max(1, (85 - prev) * 0.15);
        return prev + inc;
      });
    }, 150);
  };

  const completeProgress = () => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  };

  // When pathname or searchParams change, route transition is finished
  useEffect(() => {
    completeProgress();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Don't intercept modified clicks (Cmd/Ctrl/Shift/Middle click)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, download, tel, mailto, target="_blank", or hash-only links
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        (href.startsWith("/#") && pathname === "/")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const isSameHost = url.origin === window.location.origin;

      if (!isSameHost) return;

      const isSamePathAndQuery =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      // If navigation to a different page/query, trigger progress bar instantly
      if (!isSamePathAndQuery) {
        startProgress();
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] pointer-events-none z-[99999]"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FAA904] via-[#F8861D] to-[#043569] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "200ms" : "250ms",
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 10px rgba(248, 134, 29, 0.7), 0 0 5px rgba(250, 169, 4, 0.5)",
        }}
      />
    </div>
  );
}
