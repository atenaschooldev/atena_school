"use client";

import Image from "next/image";
import logo from "@/assets/athena-logo.webp";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition } from "react";
import { List, X, ShoppingCart, User, SignOut, UserCircle, InstagramLogo } from "@phosphor-icons/react";
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
        setIsVisible(false);
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

  const navLinks = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/#about" },
    { label: t("courses"), href: "/courses" },
    { label: t("blog"), href: "/blog" },
  ];

  // Dynamic styling based on scroll and pathname (transparent only on home page)
  const isDarkHeroPage = pathname === "/";
  const isTransparent = isDarkHeroPage && !isScrolled;
  const showHeader = isVisible || open;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      showHeader 
        ? "translate-y-0 opacity-100" 
        : "-translate-y-full opacity-0 pointer-events-none"
    } ${
      isScrolled 
        ? "py-3 px-4 md:px-8" 
        : "py-5 px-4 md:px-8"
    }`}>
      <div className={`mx-auto max-w-7xl transition-all duration-500 rounded-full flex items-center justify-between h-16 ${
        isTransparent 
          ? "bg-black/25 backdrop-blur-[6px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.12)] px-6 py-2" 
          : "bg-background/85 backdrop-blur-lg border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-6 py-2"
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transform hover:scale-105 hover:rotate-3 active:scale-95 transition-all duration-300">
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
              className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
                isTransparent 
                  ? "text-white/95 hover:text-white hover:bg-white/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" 
                  : "text-foreground/80 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Icons & Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group">
            <div className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
              isTransparent 
                ? "text-white/90 hover:text-white hover:bg-white/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" 
                : "text-foreground/70 hover:text-primary hover:bg-primary/5"
            }`}>
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
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 hover:scale-105 active:scale-95 p-0.5 rounded-full transition-all duration-300">
                  <UserCircle className={`w-8 h-8 transition-colors ${isTransparent ? "text-white" : "text-primary"}`} />
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
              className={`text-sm font-bold border px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
                isTransparent 
                  ? "text-white border-white/30 hover:border-white hover:bg-white/10" 
                  : "text-primary border-primary hover:bg-primary hover:text-white hover:shadow-primary/25"
              }`}
            >
              Login
            </Link>
          )}

          <button 
            className={`md:hidden p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
            }`} 
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6 transform rotate-90 transition-transform duration-300" /> : <List className="w-6 h-6 transition-transform duration-300" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border border-border/50 rounded-[24px] mt-3 p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col gap-2">
          {/* Navigation Links */}
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="flex items-center justify-between py-3 px-4 text-base font-bold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 active:scale-[0.98]"
              onClick={() => setOpen(false)}
            >
              <span>{l.label}</span>
              <span className="text-muted-foreground/30 font-light">➔</span>
            </Link>
          ))}

          {/* User Section / Login */}
          <div className="pt-4 border-t border-border/40 mt-2 space-y-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-muted/65 rounded-xl">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Accesso effettuato come</p>
                  <p className="text-xs font-semibold text-foreground/90 truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between py-3 px-4 text-sm font-bold text-foreground/85 hover:bg-muted/80 rounded-xl transition-all duration-200"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 py-3 px-4 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all duration-200"
                >
                  <SignOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center py-3.5 px-4 text-sm font-extrabold text-white bg-primary hover:bg-primary/95 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 text-center"
                onClick={() => setOpen(false)}
              >
                Accedi / Login
              </Link>
            )}
          </div>

          {/* Socials & Contacts */}
          <div className="pt-4 border-t border-border/40 mt-2 flex items-center justify-between px-2 text-[10px] text-muted-foreground leading-relaxed">
            <div className="space-y-0.5">
              <p className="font-bold text-foreground/75">Viale G. Matteotti 11, Cittanova</p>
              <p>Tel: +39 375 605 2362</p>
            </div>
            <a 
              href="https://www.instagram.com/atenaschool_srls/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition active:scale-90 duration-300"
            >
              <InstagramLogo className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
