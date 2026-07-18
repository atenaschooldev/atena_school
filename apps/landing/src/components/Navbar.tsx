"use client";

import Image from "next/image";
import logo from "@/assets/logo.webp";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, User, SignOut, UserCircle, InstagramLogo, FacebookLogo, House, Users, GraduationCap, Newspaper, EnvelopeSimple, Sparkle } from "@phosphor-icons/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { getSessionId, mergeGuestBookings } from "@/lib/utils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Reset mobile menu on page transition
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
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
  };

  const navLinks = [
    { label: t("home"), href: "/", icon: House },
    { label: t("about"), href: "/#about", icon: Users },
    { label: t("courses"), href: "/courses", icon: GraduationCap },
    { label: t("test"), href: "/test-inglese", icon: Sparkle },
    { label: t("blog"), href: "/blog", icon: Newspaper },
    { label: t("contact"), href: "/#contact", icon: EnvelopeSimple },
  ];

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm py-2 px-4 md:px-8 2xl:px-16 min-[1700px]:px-24">
        <div className="mx-auto max-w-7xl 2xl:max-w-none flex items-center justify-between h-16 px-6 2xl:px-0">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => handleLinkClick("/")}
            >
              <Image
                src={logo}
                alt="Atena School"
                width={56}
                height={56}
                className="object-contain"
              />
              <div className="flex flex-col items-center leading-tight">
                <span className="font-serif font-black text-base xs:text-lg md:text-xl tracking-wider uppercase select-none whitespace-nowrap" style={{ color: '#00328F' }}>
                  Atena <span style={{ color: '#FAA904' }}>School</span>
                </span>
                <span className="text-[9px] tracking-widest uppercase select-none whitespace-nowrap" style={{ color: '#9FA2AC' }}>
                  civitatis ornamento
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href as any}
                className="text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-gray-700 hover:text-primary hover:bg-primary/10 relative"
                onClick={() => handleLinkClick(l.href)}
              >
                {l.label}
                {l.href === "/test-inglese" && (
                  <span className="absolute -top-1 -right-1 bg-[#F8861D] text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full scale-90">
                    {t("navBadge")}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/cart" className="relative group">
              <div className="p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 text-gray-600 hover:text-primary hover:bg-primary/10">
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
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:scale-105 active:scale-95 p-0.5 rounded-full transition-all duration-300">
                    <UserCircle className="w-8 h-8 transition-colors text-gray-600" />
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
                className="text-sm font-bold border border-primary/30 px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm text-primary hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
                onClick={() => handleLinkClick("/auth/login")}
              >
                Login
              </Link>
            )}
          </div>

          {/* Animated hamburger button */}
          <button
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            className="md:hidden relative p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 text-gray-700 hover:bg-primary/10"
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
      </header>

      {/* Mobile Drawer (Slide-in from right) */}
      {mounted && createPortal(
        <>
            {/* Backdrop with fade and blur */}
            <div
              className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              style={{ zIndex: 100 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div
              className={`md:hidden fixed top-0 right-0 h-[100dvh] w-full sm:max-w-[400px] bg-white text-gray-950 shadow-2xl flex flex-col z-[101] transition-transform duration-300 ease-in-out ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 shrink-0 bg-white">
                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
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
                        href={l.href as any}
                        className="flex items-center justify-between py-3.5 px-4 text-lg font-bold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-4">
                          {Icon && <Icon className="w-5 h-5 text-[#FAA904]" weight="bold" />}
                          <span>{l.label}</span>
                        </div>
                        {l.href === "/test-inglese" && (
                          <span className="bg-[#F8861D] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            {t("navBadge")}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Shopping Cart */}
                  <Link
                    href="/cart"
                    className="flex items-center justify-between py-3.5 px-4 text-lg font-bold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 active:scale-[0.98]"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <ShoppingCart className="w-5 h-5 text-[#FAA904]" weight="bold" />
                      <span>Carrello</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-[#FAA904] text-white text-xs font-black h-5 w-5 rounded-full flex items-center justify-center animate-in zoom-in bounce-in">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Bottom Section */}
                <div className="space-y-6">
                  {/* User Section / Login */}
                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    {user ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                          <p className="text-[9px] uppercase font-bold tracking-widest text-[#9FA2AC]">Accesso effettuato come</p>
                          <p className="text-xs font-semibold text-gray-800 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center justify-between py-3 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                          onClick={() => setOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setOpen(false);
                          }}
                          className="w-full flex items-center gap-2 py-3 px-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <SignOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="w-full flex items-center justify-center py-3.5 px-4 text-sm font-extrabold text-white bg-[#00328F] hover:bg-[#FAA904] rounded-xl shadow-md transition-all active:scale-95 text-center"
                        onClick={() => setOpen(false)}
                      >
                        Accedi / Login
                      </Link>
                    )}
                  </div>

                  {/* Socials & Contacts */}
                  <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-[11px] text-[#9FA2AC] leading-relaxed">
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-800">Viale G. Matteotti 11, Cittanova</p>
                      <p className="text-gray-500">Tel: +39 375 605 2362</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="https://www.instagram.com/atenaschool_srls/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition active:scale-90 duration-300"
                      >
                        <InstagramLogo className="w-5 h-5" />
                      </a>
                      <a
                        href="https://www.facebook.com/CSAtena7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition active:scale-90 duration-300"
                      >
                        <FacebookLogo className="w-5 h-5" />
                      </a>
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
