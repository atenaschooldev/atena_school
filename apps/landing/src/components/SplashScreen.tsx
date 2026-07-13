"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "@/../public/athena-logo.webp";

const SPLASH_STORAGE_KEY = "atena-school:splash-seen";
export const SPLASH_COOKIE_NAME = "atena_school_splash_seen";
const SPLASH_DURATION_MS = 2200;

const SplashScreen = () => {
  // Check sessionStorage and cookies synchronously before first render on client
  const alreadySeen = (() => {
    if (typeof window === "undefined") return false;
    try {
      const seenSession = window.sessionStorage.getItem(SPLASH_STORAGE_KEY);
      const seenCookie = document.cookie.indexOf(`${SPLASH_COOKIE_NAME}=true`) > -1;
      return !!(seenSession || seenCookie);
    } catch {
      return false;
    }
  })();

  const [isVisible, setIsVisible] = useState(!alreadySeen);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (alreadySeen) {
      return;
    }

    try {
      // Mark as seen in sessionStorage so navigation/reloads within the tab skip splash
      window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");
      // Set a persistent cookie (24h) so the server skips splash on first SSR after reload
      document.cookie = `${SPLASH_COOKIE_NAME}=true; path=/; max-age=86400; samesite=lax`;
    } catch {
      // Non-critical if storage is blocked
    }

    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
      try {
        document.documentElement.classList.remove('show-splash');
      } catch (e) {}
    }, SPLASH_DURATION_MS);

    const removeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, SPLASH_DURATION_MS + 650);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="splash-screen"
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#f7faf8] px-6 text-[#123238] transition-[opacity,transform,filter] duration-700 ease-out ${
        isLeaving ? "pointer-events-none opacity-0 scale-[1.015] leaving" : "opacity-100 scale-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Atena School"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(240,212,135,0.38),transparent_34%),radial-gradient(circle_at_14%_82%,rgba(38,105,112,0.18),transparent_34%),linear-gradient(135deg,#fbf8ef_0%,#eef7f4_48%,#dceceb_100%)]" />
      <div className="absolute inset-0 opacity-80 [background:linear-gradient(120deg,transparent_0%,transparent_38%,rgba(255,255,255,0.72)_50%,transparent_62%,transparent_100%)] animate-[splash-sweep_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards]" />
      <div className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6b35f]/28 animate-[splash-ring_2.4s_ease-out_forwards]" />
      <div className="absolute left-1/2 top-1/2 h-[56vmin] w-[56vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1f6872]/16 animate-[splash-ring_2.4s_ease-out_0.18s_forwards]" />
      <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-[#d6b35f]/70 to-transparent animate-[splash-line_1.8s_cubic-bezier(0.22,1,0.36,1)_forwards]" />
      <div className="absolute inset-x-8 bottom-[18%] h-px bg-gradient-to-r from-transparent via-[#1f6872]/22 to-transparent sm:inset-x-20 animate-[splash-line_1.8s_cubic-bezier(0.22,1,0.36,1)_0.2s_forwards]" />

      <div className="relative z-10 flex max-w-5xl flex-col items-center px-4 pb-16 pt-28 text-center">
        <div className="relative mb-8 flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-white/70 bg-white/58 p-5 shadow-[0_18px_55px_rgba(31,104,114,0.18),0_8px_28px_rgba(214,179,95,0.18),inset_0_1px_1px_rgba(255,255,255,0.75)] backdrop-blur-[10px] md:h-40 md:w-40 animate-[splash-mark_1.35s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="absolute inset-3 rounded-full border border-[#d6b35f]/34 animate-[splash-halo_2.2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,transparent,rgba(31,104,114,0.24),rgba(214,179,95,0.34),transparent_38%)] opacity-80 blur-[1px] animate-[splash-spin_3.2s_linear_infinite]" />
          <div className="absolute inset-[3px] rounded-full bg-white/72" />
          <div className="relative h-full w-full translate-x-[-2px] translate-y-[-4px] animate-[splash-float_2.4s_ease-in-out_infinite]">
            <Image
              src={logo}
              alt="Atena School"
              fill
              priority
              className="object-contain drop-shadow-[0_12px_24px_rgba(31,104,114,0.22)]"
            />
          </div>
        </div>

        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.42em] text-[#b48d35] sm:text-sm animate-[splash-reveal_0.8s_cubic-bezier(0.22,1,0.36,1)_0.25s_both]">
            Atena School
          </p>
          <h2 className="text-balance text-3xl font-black leading-tight sm:text-5xl animate-[splash-reveal_0.9s_cubic-bezier(0.22,1,0.36,1)_0.42s_both]">
            Lingue. Metodo. Futuro.
          </h2>
          <p className="mt-4 max-w-md text-sm font-medium leading-6 text-[#31565d]/75 sm:text-base animate-[splash-reveal_0.9s_cubic-bezier(0.22,1,0.36,1)_0.58s_both]">
            Corsi Cambridge, certificazioni EIPASS e percorsi su misura a Cittanova.
          </p>
          <div className="mt-10 h-px w-28 bg-gradient-to-r from-transparent via-[#b48d35]/70 to-transparent animate-[splash-reveal_0.9s_cubic-bezier(0.22,1,0.36,1)_0.78s_both]" />
        </div>

        <div className="pointer-events-none h-16 shrink-0 select-none md:h-28" aria-hidden="true" />
      </div>
    </div>
  );
};

export default SplashScreen;
