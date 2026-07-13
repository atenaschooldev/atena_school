"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User, Envelope, Lock } from "@phosphor-icons/react";
import Image from "next/image";
import logo from "@/assets/athena-logo.webp";
import heroLondon from "@/assets/hero-london.webp";

function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t("success"));
        router.push(`/auth/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 pt-20 py-4 bg-background">
      {/* Container holding both visual and form */}
      <div className="w-full max-w-4xl grid lg:grid-cols-12 bg-card rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Left Side - Visual Panel (hidden on mobile/tablet, visible on lg) */}
        <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-primary/15 flex-col justify-between p-8 min-h-[360px]">
          {/* Background Image of London with overlay */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroLondon} 
              alt="London" 
              fill
              className="object-cover object-center filter saturate-[0.85] brightness-[0.4]"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-black/20" />
          </div>

          {/* Top content */}
          <div className="relative z-10 flex items-center gap-3">
            <Image 
              src={logo} 
              alt="Atena School" 
              width={40} 
              height={40} 
              className="object-contain bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20"
            />
            <span className="text-white font-serif font-bold text-base tracking-wider">Atena School</span>
          </div>

          {/* Bottom content */}
          <div className="relative z-10 text-white space-y-3">
            <p className="text-lg font-serif italic font-medium leading-relaxed opacity-95">
              "Con le lingue, ti senti a casa ovunque"
            </p>
            <div className="w-8 h-1 bg-white/60 rounded-full" />
            <p className="text-xs uppercase tracking-wider font-semibold opacity-75">
              Edward De Waal
            </p>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center p-5 sm:p-6 lg:p-10 bg-card">
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-serif text-gradient font-black tracking-tight">{t("title")}</h2>
              <p className="text-muted-foreground/90 font-medium text-xs lg:text-sm leading-relaxed">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 lg:space-y-4">
              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="fullName" className="text-foreground/80 font-bold text-xs tracking-wider uppercase">{t("fullName")}</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-primary/60 group-focus-within:text-primary group-focus-within:scale-105 transition-all duration-300" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-10 lg:h-12 text-sm bg-background/50 border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all duration-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-bold text-xs tracking-wider uppercase">Email</Label>
                <div className="relative group">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-primary/60 group-focus-within:text-primary group-focus-within:scale-105 transition-all duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 lg:h-12 text-sm bg-background/50 border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all duration-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="password" className="text-foreground/80 font-bold text-xs tracking-wider uppercase">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-primary/60 group-focus-within:text-primary group-focus-within:scale-105 transition-all duration-300" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10 lg:h-12 text-sm bg-background/50 border-border/80 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all duration-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <Button 
                  className="w-full h-10 lg:h-12 text-sm font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/15 hover:shadow-primary/25 flex items-center justify-center gap-2" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : t("submit")}
                </Button>
              </div>
            </form>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-bold tracking-wider">{t("oauth")}</span>
              </div>
            </div>

            <div className="flex justify-center flex-col gap-3">
              <Button 
                variant="outline" 
                className="font-bold shadow-sm w-full h-10 lg:h-12 text-sm rounded-xl flex items-center justify-center gap-2.5 border border-border/80 bg-background/40 hover:bg-accent/80 hover:text-accent-foreground active:scale-[0.99] transition-all duration-300 hover:border-primary/30" 
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </div>

            <div className="text-center pt-1">
              <Link 
                href={`/auth/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} 
                className="text-sm text-primary hover:text-primary/80 font-bold transition-colors duration-200"
              >
                {t("hasAccount")}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
