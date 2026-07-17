"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import heroDefault from "@/assets/hero-london.webp";


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

  const features = [
    t("feature_1"),
    t("feature_2"),
    t("feature_3"),
    t("feature_4"),
  ];

  return (
    <section id="home" className="relative min-h-[calc(100dvh+3rem)] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-28 pb-20 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
      {/* Background with advanced overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Atena School"
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover animate-zoom-breathing [will-change:transform]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/65 via-[#043569]/30 to-transparent" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/10 top-10 right-10 blur-3xl rounded-full absolute pointer-events-none" />
      <div className="glow-orb w-[500px] h-[500px] bg-secondary/5 bottom-10 left-10 blur-3xl rounded-full absolute pointer-events-none" />

      {/* Content Grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-12 lg:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column - Content Area */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Location Pin */}
            <div className="flex items-center gap-1.5 text-[#F8861D] font-bold text-xs uppercase tracking-widest mb-2 sm:mb-4">
              <MapPin size={14} className="text-[#F8861D]" weight="bold" />
              <span>{t("location")}</span>
            </div>

            {/* Main Heading */}
            <h1
              className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 uppercase leading-[1.1] drop-shadow-sm"
            >
              {title}
            </h1>

            {/* Subtitle / Tagline */}
            <div className="space-y-1 mb-3 sm:mb-4">
              <p
                className="font-serif text-base sm:text-xl lg:text-2xl italic text-white/95 max-w-xl leading-relaxed font-bold drop-shadow"
              >
                {tagline}
              </p>
              <p className="text-[10px] sm:text-xs text-[#F8861D] font-bold uppercase tracking-widest pl-1 drop-shadow-sm">
                — {t("author")}
              </p>
            </div>

            {/* Description */}
            <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed mb-4 sm:mb-8">
              Centro autorizzato per la preparazione agli esami Cambridge English e alle certificazioni informatiche EIPASS.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start w-full">
              <a
                href="#contact"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-6 py-3.5 rounded-full font-black text-sm transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Prenota una consulenza gratuita
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
              </a>
              <a
                href="#about"
                className="inline-flex w-full sm:w-auto items-center justify-center border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-full font-black text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Scopri di più
              </a>
            </div>
          </div>

          {/* Right Column - Glassmorphic Accent Panel */}
          <div className="lg:col-span-5 w-full flex flex-col items-center justify-center lg:items-end mt-3 lg:mt-0">
            <div className="w-full max-w-[400px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 sm:gap-6">


              {/* Categories Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_miur_val")}
                  </span>
                  <span className="text-[#F8861D] text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_miur_lbl")}
                  </span>
                </div>
                <div className="flex flex-col border-x border-white/10">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_exams_val")}
                  </span>
                  <span className="text-[#F8861D] text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_exams_lbl")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide leading-none whitespace-nowrap">
                    {t("seo_voucher_val")}
                  </span>
                  <span className="text-[#F8861D] text-[9px] font-bold uppercase tracking-wider mt-1.5">
                    {t("seo_voucher_lbl")}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10" />

              {/* Features bullet points */}
              <div className="flex flex-col gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <CheckCircle size={18} className="text-[#F8861D] shrink-0 mt-0.5" weight="bold" />
                    <p className="text-white/85 text-[11px] font-bold leading-relaxed text-left">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>


    </section>
  );
};

export default HeroSection;
