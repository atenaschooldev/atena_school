"use client";

import Image from "next/image";
import logo from "@/assets/logo.webp";
import { useEffect, useState, useTransition, useRef } from "react";
import { createPortal } from "react-dom";
import { InstagramLogo, FacebookLogo, House, Users, GraduationCap, EnvelopeSimple, Sparkle } from "@phosphor-icons/react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useMounted } from "@/hooks/useMounted";
import { env } from "@/config/env";
import { DEFAULT_SCHOOL_PROFILE, formatFullSchoolAddress } from "@atena/core";
import type { SchoolProfile } from "@atena/api-types";
import { getStudentPortalUrl } from "@/lib/urls";

interface NavbarProps {
  school?: SchoolProfile;
}

const Navbar = ({ school = DEFAULT_SCHOOL_PROFILE }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }
  const isHome = pathname === "/";
  const currentLocale = useLocale();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const limit = isHome ? window.innerHeight - 80 : 20;

      setIsScrolled(currentScrollY > limit);

      if (currentScrollY <= 20) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down -> hide header
        setVisible(false);
      } else {
        // Scrolling up -> show header
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHome]);

  // Lock body scroll when mobile menu is open, compensating for scrollbar width to prevent layout shift
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    if (href.startsWith("/#") || href.startsWith("#")) {
      const id = href.replace(/^\/?#/, "");
      if (pathname === "/") {
        e.preventDefault();
        try {
          window.history.replaceState(null, "", `#${id}`);
        } catch {}

        requestAnimationFrame(() => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
              const yOffset = -80;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }, 60);
        });
      } else {
        router.push(href);
      }
    } else if (href === "/") {
      if (pathname === "/") {
        e.preventDefault();
        try {
          window.history.replaceState(null, "", "/");
        } catch {}
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { label: t("home"), href: "/", icon: House },
    { label: t("about"), href: "/#chi-siamo", icon: Users },
    { label: t("courses"), href: "/corsi", icon: GraduationCap },
    { label: t("test"), href: "/test-inglese", icon: Sparkle },
    { label: t("contact"), href: "/#contatti", icon: EnvelopeSimple },
  ];

  const isLightHeader = false;

  const isMinimalHeader =
    /\/corsi\/.+/.test(pathname ?? "") ||
    /\/checkout\/.+/.test(pathname ?? "") ||
    /\/book\/.+/.test(pathname ?? "");

  const isCoursePage = /\/corsi\/.+/.test(pathname ?? "");

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 py-1.5 md:py-2 px-3 md:px-8 ${visible ? "translate-y-0" : "-translate-y-full"
        } bg-white shadow-sm border-b border-slate-100`}>
        <div className="mx-auto max-w-7xl flex items-center justify-between h-12 md:h-16 px-2 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 md:gap-3"
              onClick={(e) => handleLinkClick(e, "/")}
              translate="no"
            >
              <div className="bg-white p-0.5 rounded-full shadow-sm border border-gray-100 flex items-center justify-center shrink-0 w-9 h-9 md:w-12 md:h-12">
                <Image
                  src={logo}
                  alt={school.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-center leading-tight" translate="no">
                <span className="font-serif font-black text-sm xs:text-base md:text-xl tracking-wider uppercase select-none whitespace-nowrap" style={{ color: isLightHeader ? '#ffffff' : '#00328F' }}>
                  {school.name.split(' ')[0]} <span style={{ color: '#FAA904' }}>{school.name.split(' ').slice(1).join(' ') || 'School'}</span>
                </span>
                {school.tagline && (
                  <span
                    className="text-[8px] md:text-[9px] tracking-widest uppercase select-none whitespace-nowrap transition-all duration-300 mt-0.5"
                    style={{ color: isLightHeader ? 'rgba(255, 255, 255, 0.6)' : '#9FA2AC' }}
                  >
                    {school.tagline}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop links — hidden on minimal header routes */}
          {!isMinimalHeader && (
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 relative ${isLightHeader
                      ? "text-white hover:text-[#FAA904] hover:bg-white/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/10"
                    }`}
                  onClick={(e) => handleLinkClick(e, l.href)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Icons & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isMinimalHeader ? (
              /* Minimal course/checkout actions: back link (on course pages) + Area Personale */
              <>
                {isCoursePage && (
                  <>
                    <Link
                      href="/corsi"
                      className="text-sm font-bold text-slate-500 hover:text-[#043569] transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-translate-x-0.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Tutti i corsi
                    </Link>
                    <div className="w-px h-5 bg-slate-200" />
                  </>
                )}
                <a
                  href={getStudentPortalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full bg-[#043569] text-white hover:bg-[#F8861D] transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                >
                  Area Personale
                </a>
              </>
            ) : (
              /* Full actions */
              <>
                <a
                  href={getStudentPortalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${isLightHeader
                      ? "bg-[#F8861D] text-white hover:bg-white hover:text-primary"
                      : "bg-[#043569] text-white hover:bg-[#F8861D]"
                    }`}
                >
                  Area Personale
                </a>
              </>
            )}
          </div>

          {/* Mobile Right Actions: <- Corsi back link (if course page) + Hamburger Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {isCoursePage && (
              <Link
                href="/corsi"
                className="text-xs font-bold text-[#043569] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Corsi
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              aria-expanded={open}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
                isLightHeader ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-primary/10"
              }`}
              onClick={() => setOpen(!open)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="overflow-visible"
              >
                {/* Top bar */}
                <line
                  x1="3" y1="6" x2="21" y2="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: "12px 6px",
                    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s",
                    transform: open ? "rotate(45deg) translateY(6px)" : "rotate(0deg) translateY(0)",
                  }}
                />
                {/* Middle bar */}
                <line
                  x1="3" y1="12" x2="21" y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: "12px 12px",
                    transition: "opacity 0.2s 0.05s, transform 0.2s",
                    opacity: open ? 0 : 1,
                    transform: open ? "scaleX(0)" : "scaleX(1)",
                  }}
                />
                {/* Bottom bar */}
                <line
                  x1="3" y1="18" x2="21" y2="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    transformOrigin: "12px 18px",
                    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s",
                    transform: open ? "rotate(-45deg) translateY(-6px)" : "rotate(0deg) translateY(0)",
                  }}
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Slide-in from right) */}
      {mounted && createPortal(
        <>
          {/* Backdrop with fade and blur */}
          <div
            className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            style={{ zIndex: 100 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className={`md:hidden fixed top-0 right-0 h-[100dvh] w-full sm:max-w-[400px] bg-white text-gray-950 shadow-2xl flex flex-col z-[101] transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
              }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 shrink-0 bg-white">
              {/* Logo / Brand */}
              <Link href="/" className="flex items-center gap-2" onClick={(e) => handleLinkClick(e, "/")}>
                <Image
                  src={logo}
                  alt="Atena School"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-serif font-black text-sm tracking-wider uppercase select-none whitespace-nowrap text-[#00328F]">
                    Atena <span className="text-[#FAA904]">School</span>
                  </span>
                  <span className="text-[8px] tracking-widest uppercase select-none whitespace-nowrap text-[#9FA2AC]">
                    civitatis ornamento
                  </span>
                </div>
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 duration-200 flex items-center justify-center shadow-sm"
                aria-label="Chiudi menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between gap-8 bg-white">
              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                {navLinks.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="flex items-center justify-between py-3.5 px-4 text-lg font-bold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                      onClick={(e) => handleLinkClick(e, l.href)}
                    >
                      <div className="flex items-center gap-4">
                        {Icon && <Icon className="w-5 h-5 text-[#FAA904]" weight="bold" />}
                        <span>{l.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Section */}
              <div className="space-y-6">
                {/* User Section / Login */}
                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <a
                    href={getStudentPortalUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center py-3.5 px-4 text-sm font-black uppercase tracking-wider text-white bg-[#043569] hover:bg-[#F8861D] rounded-xl shadow-md transition-all active:scale-95 text-center"
                    onClick={() => setOpen(false)}
                  >
                    Area Personale
                  </a>
                </div>

                {/* Socials & Contacts */}
                <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-[11px] text-[#9FA2AC] leading-relaxed">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-800">{formatFullSchoolAddress(school)}</p>
                    <p className="text-gray-500">Tel: {school.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {school.socials?.instagram && (
                      <a
                        href={school.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition active:scale-90 duration-300"
                        aria-label="Instagram"
                      >
                        <InstagramLogo className="w-5 h-5" />
                      </a>
                    )}
                    {school.socials?.facebook && (
                      <a
                        href={school.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition active:scale-90 duration-300"
                        aria-label="Facebook"
                      >
                        <FacebookLogo className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
        , document.body)}
    </>
  );
};

export default Navbar;
