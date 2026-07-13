"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Medal, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import heroDefault from "@/../public/hero-london.webp";
import EipassCard from "@/components/EipassCard";
import CambridgeCard from "@/components/CambridgeCard";

interface HeroSectionProps {
  data?: any;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");
  const locale = useLocale();

  // Handle multilingual fields from Supabase
  const title = data?.[`title_${locale}`] || t("title");
  const tagline = data?.[`tagline_${locale}`] || t("tagline");
  const backgroundImage = data?.image_url || heroDefault;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24 pb-16 lg:py-0">
      {/* Background with advanced overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Atena School"
          fill
          className="object-cover animate-zoom-breathing [will-change:transform]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/75 via-[#043569]/40 to-[#F8861D]/25" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/20 top-10 right-10 blur-3xl rounded-full absolute pointer-events-none" />
      <div className="glow-orb w-[500px] h-[500px] bg-secondary/10 bottom-10 left-10 blur-3xl rounded-full absolute pointer-events-none" />

      {/* Content Grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-12 lg:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column - Content Area */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Location Pin */}
            <div className="flex items-center gap-1.5 text-[#F8861D] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-3 sm:mb-4">
              <MapPin size={14} className="text-[#F8861D]" weight="bold" />
              <span>{t("location")}</span>
            </div>

            {/* Main Heading */}
            <h1
              className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 uppercase leading-[1.1] drop-shadow-sm"
            >
              {title}
            </h1>

            {/* Tagline */}
            <p
              className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl italic text-white/90 max-w-xl leading-relaxed font-light drop-shadow mb-3 sm:mb-4"
            >
              {tagline}
            </p>
            
            {/* Author */}
            <p className="text-[10px] sm:text-xs text-white/50 mb-6 sm:mb-8 tracking-widest uppercase font-semibold">— {t("author")}</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start w-full">
              <a
                href="#contact"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                {t("cta_booking")}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
              </a>
              <a
                href="/courses"
                className="inline-flex w-full sm:w-auto items-center justify-center border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                {t("cta_courses")}
              </a>
            </div>
          </div>

          {/* Right Column - Glassmorphic Accent Panel */}
          <div className="lg:col-span-5 w-full flex flex-col items-center justify-center lg:items-end mt-4 lg:mt-0">
            <div className="w-full max-w-[400px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5 sm:gap-6">
              
              {/* Badges Container */}
              <div className="flex flex-col gap-4 w-full">
                <CambridgeCard className="max-w-none shadow-none hover:scale-100" />
                <EipassCard className="max-w-none shadow-none hover:scale-100" />
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10" />

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_miur_val")}
                  </span>
                  <span className="text-white/50 text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_miur_lbl")}
                  </span>
                </div>
                <div className="flex flex-col border-x border-white/10">
                  <span className="text-[#F8861D] font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_exams_val")}
                  </span>
                  <span className="text-white/50 text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_exams_lbl")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_voucher_val")}
                  </span>
                  <span className="text-white/50 text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_voucher_lbl")}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10" />

              {/* Features bullet points */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-[#F8861D] shrink-0 mt-0.5">
                    <Medal size={18} weight="bold" />
                  </div>
                  <p className="text-white/80 text-xs leading-relaxed text-left">
                    {t("feature_cert")}
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                    <ShieldCheck size={18} weight="bold" />
                  </div>
                  <p className="text-white/80 text-xs leading-relaxed text-left">
                    {t("feature_audience")}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Curved bottom transition to About */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-background">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
