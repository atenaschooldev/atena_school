"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Envelope, Lock, User, Eye, EyeSlash } from "@phosphor-icons/react";
import { mergeGuestBookings } from "@/lib/utils";
import Image from "next/image";
import logo from "@/assets/logo.webp";
import heroLondon from "@/assets/hero-london.avif";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await mergeGuestBookings(supabase, data.user.id);
      toast.success("Acceduto con successo!");
      router.push(redirectUrl);
      router.refresh();
    }
    setLoading(false);
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
    <div className="flex-grow flex items-center justify-center px-4 py-4 lg:py-0 relative bg-[#06121E] lg:h-[calc(100vh-184px)] min-h-[460px] max-h-[780px]:min-h-[400px] responsive-wrapper">
      {/* Full Page Background Image of London */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroLondon}
          alt="London"
          fill
          className="object-cover object-center filter saturate-[0.85] brightness-[0.65]"
          priority
        />
        {/* Exact same overlay from Hero section to keep colors warm and unified */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/65 via-[#043569]/35 to-transparent" />
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 relative z-10 animate-in fade-in duration-500">

        {/* Left Side - Visual Panel (rendered directly on the background) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-2 h-[340px] xl:h-[400px] max-h-[780px]:h-[300px]">
          {/* Empty spacer to align content */}
          <div />

          {/* Center Content: Title */}
          <div className="text-white space-y-2 text-left">
            <h1 className="text-4xl lg:text-5xl font-serif font-black tracking-tight leading-none uppercase">
              Bentornato<span className="text-[#F8861D]">!</span>
            </h1>
            <p className="text-sm text-white/70 font-medium">
              Accedi al tuo account per continuare
            </p>
          </div>

          {/* Bottom Content: Quote */}
          <div className="text-white border-l-2 border-[#F8861D] pl-4 space-y-1 text-left">
            <p className="text-sm font-serif italic font-bold leading-relaxed text-white/90">
              "Con le lingue,<br />
              ti senti a casa ovunque."
            </p>
            <p className="text-[10px] uppercase tracking-widest font-black text-[#F8861D]">
              — Edward De Waal
            </p>
          </div>
        </div>

        {/* Right Side - Form Card */}
        <div className="lg:col-span-5 lg:col-start-8 bg-white border border-gray-150 rounded-[32px] p-6 sm:p-7 xl:p-10 shadow-xl flex flex-col justify-center w-full max-w-[410px] xl:max-w-[460px] mx-auto lg:max-w-none max-h-[780px]:py-4 max-h-[780px]:px-6 responsive-card">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4 xl:mb-6 max-h-[780px]:mb-3 responsive-header">
            <div className="w-10 h-10 xl:w-12 xl:h-12 max-h-[780px]:w-9 max-h-[780px]:h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#F8861D] bg-gray-50 shrink-0 responsive-avatar-circle">
              <User className="w-5 h-5 xl:w-6 xl:h-6 max-h-[780px]:w-4.5 max-h-[780px]:h-4.5 responsive-avatar-icon text-gray-700" />
            </div>
            <div className="text-left">
              <h2 className="text-lg xl:text-xl font-serif font-black text-gray-900 leading-none max-h-[780px]:text-base">Accedi</h2>
              <p className="text-[10px] xl:text-xs text-gray-500 mt-1 max-h-[780px]:mt-0.5">Inserisci le tue credenziali</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 xl:space-y-4.5 max-h-[780px]:space-y-2.5 responsive-form">
            {/* Email Field */}
            <div className="space-y-1 max-h-[780px]:space-y-0.5 text-left responsive-field-container">
              <label htmlFor="email" className="text-[10px] xl:text-xs font-bold text-gray-700 tracking-wider max-h-[780px]:text-[9px] responsive-label">Email</label>
              <div className="relative group">
                <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 xl:w-4.5 xl:h-4.5 text-gray-400 group-focus-within:text-[#F8861D] transition-colors duration-300" />
                <input
                  id="email"
                  type="email"
                  placeholder="esempio@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-2 px-10 text-base lg:text-xs xl:text-sm text-gray-900 placeholder-gray-400 outline-none h-10 xl:h-12 max-h-[780px]:h-9 transition-all duration-300 responsive-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 max-h-[780px]:space-y-0.5 text-left responsive-field-container">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[10px] xl:text-xs font-bold text-gray-700 tracking-wider max-h-[780px]:text-[9px] responsive-label">Password</label>
                <Link href="/auth/forgot-password" className="text-[10px] xl:text-xs text-[#F8861D] hover:underline font-bold transition-all duration-200 max-h-[780px]:text-[9px] responsive-label">
                  Password dimenticata?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 xl:w-4.5 xl:h-4.5 text-gray-400 group-focus-within:text-[#F8861D] transition-colors duration-300" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#F8861D] focus:ring-1 focus:ring-[#F8861D]/30 rounded-xl py-2 px-10 pr-10 text-base lg:text-xs xl:text-sm text-gray-900 placeholder-gray-400 outline-none h-10 xl:h-12 max-h-[780px]:h-9 transition-all duration-300 responsive-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
                >
                  {showPassword ? <EyeSlash className="w-4 h-4 xl:w-4.5 xl:h-4.5" /> : <Eye className="w-4 h-4 xl:w-4.5 xl:h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Issues */}
            <div className="flex items-center justify-between pt-0.5 max-h-[780px]:pt-0 responsive-checkbox-row">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="rounded border-gray-300 bg-gray-50 text-[#F8861D] focus:ring-offset-0 focus:ring-0 w-3.5 h-3.5 xl:w-4 xl:h-4 max-h-[780px]:w-3 max-h-[780px]:h-3 cursor-pointer"
                />
                <span className="text-[11px] xl:text-xs text-gray-600 group-hover:text-gray-800 transition-colors duration-200 max-h-[780px]:text-[10px] responsive-checkbox-text">
                  Ricordami
                </span>
              </label>
              <Link href="#" className="text-[10px] xl:text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200 max-h-[780px]:text-[9px] responsive-label">
                Hai problemi ad accedere?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-1 max-h-[780px]:pt-0.5 responsive-submit-container">
              <button
                type="submit"
                className="w-full bg-[#F8861D] hover:bg-[#e0730d] text-white font-black text-xs xl:text-sm py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 h-10 xl:h-12 max-h-[780px]:h-9 transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer select-none responsive-button"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Accedi →
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative py-2.5 xl:py-3.5 max-h-[780px]:py-1.5 responsive-divider">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[9px] xl:text-[10px] uppercase max-h-[780px]:text-[8px]">
              <span className="bg-white px-3 text-gray-400 font-black tracking-widest">
                OPPURE CONTINUA CON
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2.5 h-9.5 xl:h-11 max-h-[780px]:h-9 transition-all duration-300 cursor-pointer text-xs xl:text-sm responsive-button shadow-sm"
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Accedi con Google
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-3 xl:pt-4 max-h-[780px]:pt-2 responsive-register">
            <span className="text-[11px] xl:text-xs text-gray-500 font-bold max-h-[780px]:text-[10px]">
              Non hai un account?{" "}
              <Link
                href={`/auth/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="text-[#F8861D] hover:underline transition-colors duration-200"
              >
                Registrati
              </Link>
            </span>
          </div>

          {/* Native CSS Media Query for viewports with height <= 780px */}
          <style>{`
            @media (max-height: 780px) and (min-width: 1024px) {
              .responsive-wrapper {
                height: calc(100vh - 146px) !important;
                min-height: 400px !important;
              }
              .responsive-card {
                padding: 1.25rem 1.5rem !important;
                max-width: 390px !important;
              }
              .responsive-header {
                margin-bottom: 0.75rem !important;
              }
              .responsive-avatar-circle {
                width: 2.25rem !important;
                height: 2.25rem !important;
              }
              .responsive-avatar-icon {
                width: 1.125rem !important;
                height: 1.125rem !important;
              }
              .responsive-form {
                gap: 0.625rem !important;
              }
              .responsive-field-container {
                gap: 0.125rem !important;
              }
              .responsive-label {
                font-size: 9px !important;
              }
              .responsive-input {
                height: 2.25rem !important;
                font-size: 0.75rem !important;
              }
              .responsive-checkbox-row {
                padding-top: 0 !important;
              }
              .responsive-checkbox-text {
                font-size: 10px !important;
              }
              .responsive-submit-container {
                padding-top: 0.125rem !important;
              }
              .responsive-button {
                height: 2.25rem !important;
                font-size: 0.75rem !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              }
              .responsive-divider {
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
              }
              .responsive-register {
                padding-top: 0.5rem !important;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
