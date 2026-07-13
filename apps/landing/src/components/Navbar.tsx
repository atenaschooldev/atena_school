"use client";

import Image from "next/image";
import logo from "@/assets/athena-logo.png";
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

  const navLinks = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/#about" },
    { label: t("courses"), href: "/courses" },
    { label: t("blog"), href: "/blog" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
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
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group">
            <ShoppingCart className="w-5 h-5 text-foreground/60 cursor-pointer group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1 rounded-full transition-colors">
                  <UserCircle className="w-8 h-8 text-primary" />
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
            <Link href="/auth/login" className="text-sm font-semibold text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all">
              Login
            </Link>
          )}

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t px-4 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href as any}
              className="block py-3 text-sm font-medium text-foreground/80 hover:text-primary border-b border-border/50"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
