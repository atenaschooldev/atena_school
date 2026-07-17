"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, ArrowRight } from "@phosphor-icons/react";
import heroDefault from "@/assets/hero-london.webp";
import heroMobile from "@/assets/hero-london-mobile.webp";


interface HeroSectionProps {
  data?: any;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");
  const locale = useLocale();

  // Handle multilingual fields from Supabase
  const title = data?.[`title_${locale}`] || t("title");
  const tagline = data?.[`tagline_${locale}`] || t("tagline");

  return (
    <section id="home" className="relative min-h-svh lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-28 pb-20 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
      {/* Background with advanced overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mobile Background */}
        <Image
          src={data?.image_url || heroMobile}
          alt="Atena School"
          fill
          sizes="100vw"
          className="block sm:hidden object-cover object-[100%_center] animate-zoom-breathing [will-change:transform]"
          priority
        />
        {/* Desktop/Tablet Background */}
        <Image
          src={data?.image_url || heroDefault}
          alt="Atena School"
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="hidden sm:block object-cover object-[43%_center] lg:object-center animate-zoom-breathing [will-change:transform]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/65 via-[#043569]/30 to-transparent" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/10 top-10 right-10 blur-2xl rounded-full absolute pointer-events-none" />
      <div className="glow-orb w-[500px] h-[500px] bg-secondary/5 bottom-10 left-10 blur-2xl rounded-full absolute pointer-events-none" />

      {/* Content Grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 sm:mt-12 lg:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column - Content Area */}
          <div className="lg:col-span-10 flex flex-col items-start text-left -translate-y-6 sm:translate-y-0">

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

        </div>
      </div>


    </section>
  );
};

export default HeroSection;

