/**
 * Universal Pointer-Events & Overlay Watchdog for Admin SPA
 * 
 * Radix UI / Headless UI modals and overlays (Dialog, Sheet, Drawer, AlertDialog, Select, DropdownMenu)
 * occasionally leave `pointer-events: none` on `document.body` when unmounting abruptly or navigating.
 * 
 * This watchdog continuously monitors `document.body` and automatically restores pointer interactions
 * whenever no active open dialog or sheet is present in the DOM.
 */

function checkAndFixPointerEvents() {
  if (typeof document === "undefined" || !document.body) return;

  // Check if any modal or floating dismissable layer is actively open
  const activeOverlay = document.querySelector(
    '[role="dialog"]:not([data-state="closed"]), ' +
    '[role="alertdialog"]:not([data-state="closed"]), ' +
    '[data-radix-portal] [data-state="open"], ' +
    '[data-state="open"][aria-modal="true"], ' +
    '[data-state="open"][role="menu"], ' +
    '[data-state="open"][role="listbox"], ' +
    '[data-radix-focus-guard]'
  );

  // If no open modal/dialog/menu exists in DOM, ensure pointer-events are NOT blocked on body
  if (!activeOverlay) {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
    if (document.documentElement.style.pointerEvents === "none") {
      document.documentElement.style.pointerEvents = "";
    }
  }
}

export function initPointerEventsWatchdog() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // 1. MutationObserver watching style/attribute changes on document.body
  try {
    const observer = new MutationObserver(() => {
      checkAndFixPointerEvents();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class", "data-scroll-locked"],
      childList: true,
      subtree: false,
    });
  } catch {
    // Ignore in non-supporting environments
  }

  // 2. Global event listeners for user interactions (capture phase)
  const handleInteraction = () => {
    // Quick microtask check on user click or touch
    checkAndFixPointerEvents();
  };

  window.addEventListener("pointerdown", handleInteraction, { capture: true, passive: true });
  window.addEventListener("click", handleInteraction, { capture: true, passive: true });
  window.addEventListener("focus", handleInteraction, { passive: true });
  window.addEventListener("popstate", handleInteraction, { passive: true });
  document.addEventListener("visibilitychange", handleInteraction, { passive: true });

  // 3. Patch history.pushState and history.replaceState to clear on navigation
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const res = originalPushState.apply(this, args);
    setTimeout(checkAndFixPointerEvents, 0);
    return res;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const res = originalReplaceState.apply(this, args);
    setTimeout(checkAndFixPointerEvents, 0);
    return res;
  };

  // Run initial check
  checkAndFixPointerEvents();
}
