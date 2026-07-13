"use client";

import Image from "next/image";
import logo from "@/assets/athena-logo.webp";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useTransition } from "react";
import { Menu, X, ShoppingCart, User, LogOut, UserCircle } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

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

  // Dynamic styling based on scroll and pathname
  const isDarkHeroPage = pathname === "/" || pathname === "/courses" || pathname.startsWith("/blog");
  const isTransparent = isDarkHeroPage && !isScrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
          <Link href="/" className="flex items-center gap-2 transform hover:scale-[1.03] transition-transform duration-200">
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
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-300 ${
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
            <div className={`p-2 rounded-full transition-all duration-300 ${
              isTransparent 
                ? "text-white/90 hover:text-white hover:bg-white/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" 
                : "text-foreground/70 hover:text-primary hover:bg-primary/5"
            }`}>
              <ShoppingCart className="w-5 h-5 cursor-pointer" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-0.5 rounded-full transition-colors">
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
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              href="/auth/login" 
              className={`text-sm font-bold border px-5 py-2 rounded-full transition-all duration-300 shadow-sm ${
                isTransparent 
                  ? "text-white border-white/30 hover:border-white hover:bg-white/10" 
                  : "text-primary border-primary hover:bg-primary hover:text-white"
              }`}
            >
              Login
            </Link>
          )}

          <button 
            className={`md:hidden p-2 rounded-full transition-colors ${
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
            }`} 
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl mt-2 px-4 pb-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="block py-3.5 text-sm font-medium text-foreground/80 hover:text-primary border-b border-border/50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
