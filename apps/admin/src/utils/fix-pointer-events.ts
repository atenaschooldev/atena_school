/**
 * Universal Pointer-Events & Overlay Watchdog for Admin SPA
 */
export function initPointerEventsWatchdog() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const resetBody = () => {
    if (document.body && document.body.style.pointerEvents === "none") {
      const hasActiveModal = document.querySelector('[role="dialog"][data-state="open"]');
      if (!hasActiveModal) {
        document.body.style.pointerEvents = "";
      }
    }
  };

  window.addEventListener("popstate", resetBody);
  document.addEventListener("visibilitychange", resetBody);

  // Clear on navigation
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const res = originalPushState.apply(this, args);
    setTimeout(resetBody, 50);
    return res;
  };
}
