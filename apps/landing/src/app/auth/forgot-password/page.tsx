"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Envelope, CaretLeft, Key } from "@phosphor-icons/react";
import Image from "next/image";
import heroLondon from "@/assets/hero-london.webp";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success(t("success"));
    }
    setLoading(false);
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
              Recupero<span className="text-[#F8861D]">!</span>
            </h1>
            <p className="text-sm text-white/70 font-medium">
              Reimposta la tua password in pochi passaggi
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
 
        {/* Right Side - Form Card (Semi-transparent with glass effect, aligned to the right, adaptive sizing) */}
        <div className="lg:col-span-5 lg:col-start-8 bg-[#0B1B2B]/90 backdrop-blur-md border border-white/5 rounded-[32px] p-6 sm:p-7 xl:p-10 shadow-2xl flex flex-col justify-center w-full max-w-[410px] xl:max-w-[460px] mx-auto lg:max-w-none max-h-[780px]:py-6 max-h-[780px]:px-6 responsive-card">
          {/* Header */}
          <div className="flex items-center gap-4 mb-5 xl:mb-6 max-h-[780px]:mb-4 responsive-header">
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full border border-white/10 flex items-center justify-center text-[#F8861D] bg-[#112235]/50 shrink-0 responsive-avatar-circle">
              <Key className="w-5 h-5 xl:w-6 xl:h-6 responsive-avatar-icon" />
            </div>
            <div className="text-left">
              <h2 className="text-lg xl:text-xl font-serif font-black text-white leading-none max-h-[780px]:text-base">{t("title")}</h2>
              <p className="text-[10px] xl:text-xs text-white/50 mt-1 max-h-[780px]:mt-0.5">
                {submitted ? t("success") : t("subtitle")}
              </p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleResetRequest} className="space-y-4 xl:space-y-5 max-h-[780px]:space-y-3.5 responsive-form">
              {/* Email Field */}
              <div className="space-y-1.5 text-left responsive-field-container">
                <label htmlFor="email" className="text-[10px] xl:text-xs font-bold text-white/80 tracking-wider responsive-label">{t("email")}</label>
                <div className="relative group">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 xl:w-4.5 xl:h-4.5 text-white/40 group-focus-within:text-[#F8861D] transition-colors duration-300" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#112235] border border-white/10 focus:border-[#F8861D]/50 focus:ring-1 focus:ring-[#F8861D]/50 rounded-xl py-2 px-10 text-xs xl:text-sm text-white placeholder-white/30 outline-none h-10 xl:h-12 max-h-[780px]:h-9 transition-all duration-300 responsive-input"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 responsive-submit-container">
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
                    <>{t("submit")}</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-white/70">
              <Envelope className="w-12 h-12 text-[#F8861D] mx-auto mb-4 opacity-50" />
              <p className="text-xs xl:text-sm">{t("success")}</p>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center pt-4 xl:pt-5 max-h-[780px]:pt-3 responsive-register">
            <Link
              href="/auth/login"
              className="text-[11px] xl:text-xs text-[#F8861D] hover:underline font-bold transition-colors duration-200 inline-flex items-center gap-1"
            >
              <CaretLeft className="w-3.5 h-3.5" />
              {t("backToLogin")}
            </Link>
          </div>

          {/* Native CSS Media Query for viewports with height <= 780px */}
          <style>{`
            @media (max-height: 780px) and (min-width: 1024px) {
              .responsive-wrapper {
                height: calc(100vh - 146px) !important;
                min-height: 400px !important;
              }
              .responsive-card {
                padding: 1.5rem 1.75rem !important;
                max-width: 390px !important;
              }
              .responsive-header {
                margin-bottom: 1rem !important;
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
                gap: 0.875rem !important;
              }
              .responsive-field-container {
                gap: 0.25rem !important;
              }
              .responsive-label {
                font-size: 10px !important;
              }
              .responsive-input {
                height: 2.25rem !important;
                font-size: 0.75rem !important;
              }
              .responsive-submit-container {
                padding-top: 0.25rem !important;
              }
              .responsive-button {
                height: 2.25rem !important;
                font-size: 0.75rem !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
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
