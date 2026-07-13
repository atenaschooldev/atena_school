"use client";

import Image from "next/image";
import logo from "@/assets/athena-logo.webp";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition, useRef } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, User, SignOut, UserCircle, InstagramLogo, FacebookLogo } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { getSessionId, mergeGuestBookings } from "@/lib/utils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const suppressHideRef = useRef(false);
  const supabase = createClient();

  const fetchCartCount = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const sid = getSessionId();
    
    let query = supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_cart");

    if (currentUser) {
      query = query.eq("user_id", currentUser.id);
    } else if (sid) {
      query = query.eq("session_id", sid);
    }

    const { count } = await query;
    setCartCount(count || 0);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset visibility and mobile menu on page transition
  useEffect(() => {
    setOpen(false);
    setIsVisible(true);
    setIsScrolled(false);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the top
      if (currentScrollY < 50) {
        setIsVisible(true);
        setIsScrolled(false);
        lastScrollY = currentScrollY;
        return;
      }

      setIsScrolled(true);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        if (!suppressHideRef.current) {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await mergeGuestBookings(supabase, user.id);
      }
      fetchCartCount();
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (event === "SIGNED_IN" && currentUser) {
        mergeGuestBookings(supabase, currentUser.id).then(() => {
          fetchCartCount();
        });
      } else {
        fetchCartCount();
      }
    });

    // Listen for cart updates
    window.addEventListener("cartUpdated", fetchCartCount);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out");
      router.refresh();
    }
  };

  const handleLinkClick = (href: string) => {
    setOpen(false);
    setIsVisible(true);
    
    // Suppress hiding during hash jumps and scroll animation transitions
    suppressHideRef.current = true;
    setTimeout(() => {
      suppressHideRef.current = false;
    }, 1500);
  };

  const navLinks = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/#about" },
    { label: t("courses"), href: "/courses" },
    { label: t("blog"), href: "/blog" },
    { label: t("contact"), href: "/#contact" },
  ];

  // Dynamic styling based on scroll and pathname (transparent only on home page)
  const isDarkHeroPage = pathname === "/";
  const isTransparent = isDarkHeroPage && !isScrolled;
  const showHeader = isVisible || open;

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ${
      showHeader 
        ? "translate-y-0 opacity-100" 
        : "-translate-y-full opacity-0"
    } ${
      isTransparent 
        ? "py-5 px-4 md:px-8" 
        : "py-3 px-4 md:px-8"
    }`}>
      <div className={`mx-auto max-w-7xl pointer-events-auto transition-all duration-500 rounded-full flex items-center justify-between h-16 ${
        isTransparent 
          ? "bg-black/25 backdrop-blur-[6px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.12)] px-6 py-2" 
          : "bg-primary backdrop-blur-lg border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.15)] px-6 py-2"
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="flex items-center gap-2 transform hover:scale-105 hover:rotate-3 active:scale-95 transition-all duration-300"
            onClick={() => handleLinkClick("/")}
          >
            <Image 
              src={logo} 
              alt="Atena School" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => handleLinkClick(l.href)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Icons & Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group">
            <div className="p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 text-white/90 hover:text-white hover:bg-white/10">
              <ShoppingCart className="w-5 h-5 cursor-pointer" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in bounce-in">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 hover:scale-105 active:scale-95 p-0.5 rounded-full transition-all duration-300">
                  <UserCircle className="w-8 h-8 transition-colors text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-medium text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard' as any)}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <SignOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              href="/auth/login" 
              className="text-sm font-bold border border-white/30 px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm text-white hover:border-white hover:bg-white hover:text-foreground"
              onClick={() => handleLinkClick("/auth/login")}
            >
              Login
            </Link>
          )}

          {/* Animated hamburger button */}
          <button
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            className="md:hidden relative p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 text-white hover:bg-white/10"
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


      {/* Mobile menu — always rendered, animated with max-height + opacity */}
      <div
        className="md:hidden overflow-hidden"
        style={{
          maxHeight: open ? "600px" : "0px",
          opacity: open ? 1 : 0,
          transition: open
            ? "max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease"
            : "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="bg-primary backdrop-blur-lg border border-primary/20 rounded-[24px] mt-3 p-4 shadow-xl flex flex-col gap-2">
          {/* Navigation Links — staggered slide-in */}
          {navLinks.map((l, i) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="flex items-center py-3 px-4 text-base font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-[0.98]"
              style={{
                transform: open ? "translateX(0)" : "translateX(-12px)",
                opacity: open ? 1 : 0,
                transition: `transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05 + 0.1}s, opacity 0.3s ease ${i * 0.05 + 0.1}s`,
              }}
              onClick={() => handleLinkClick(l.href)}
            >
              <span>{l.label}</span>
            </Link>
          ))}

          {/* User Section / Login */}
          <div
            className="pt-4 border-t border-white/10 mt-2 space-y-3"
            style={{
              transform: open ? "translateX(0)" : "translateX(-12px)",
              opacity: open ? 1 : 0,
              transition: `transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${navLinks.length * 0.05 + 0.1}s, opacity 0.3s ease ${navLinks.length * 0.05 + 0.1}s`,
            }}
          >
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-white/10 rounded-xl">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-white/60">Accesso effettuato come</p>
                  <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between py-3 px-4 text-sm font-bold text-white/90 hover:bg-white/10 rounded-xl transition-all duration-200"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 py-3 px-4 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                >
                  <SignOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center py-3.5 px-4 text-sm font-extrabold text-primary bg-white hover:bg-white/90 rounded-xl shadow-md transition-all active:scale-95 text-center"
                onClick={() => setOpen(false)}
              >
                Accedi / Login
              </Link>
            )}
          </div>

          {/* Socials & Contacts */}
          <div
            className="pt-4 border-t border-white/10 mt-2 flex items-center justify-between px-2 text-[10px] text-white/60 leading-relaxed"
            style={{
              transform: open ? "translateX(0)" : "translateX(-12px)",
              opacity: open ? 1 : 0,
              transition: `transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${(navLinks.length + 1) * 0.05 + 0.1}s, opacity 0.3s ease ${(navLinks.length + 1) * 0.05 + 0.1}s`,
            }}
          >
            <div className="space-y-0.5">
              <p className="font-bold text-white/80">Viale G. Matteotti 11, Cittanova</p>
              <p>Tel: +39 375 605 2362</p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/atenaschool_srls/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition active:scale-90 duration-300"
              >
                <InstagramLogo className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/CSAtena7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition active:scale-90 duration-300"
              >
                <FacebookLogo className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Backdrop rendered via portal to document.body so it sits outside the header stacking context.
          z-49 = below z-50 header/menu but above page content — clicking anywhere (sides OR below menu) closes it. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="md:hidden fixed inset-0"
          style={{ zIndex: 49 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />,
        document.body
      )}
    </>
  );
};

export default Navbar;
