"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, ArrowRight, ArrowDown } from "@phosphor-icons/react";
import heroDefault from "@/assets/hero-london.webp";
import heroMobile from "@/assets/hero-london-mobile.webp";


interface HeroSectionProps {
  data?: any;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");
  const locale = useLocale();

  const title = data?.[`title_${locale}`] || t("title");
  const tagline = data?.[`tagline_${locale}`] || t("tagline");

  return (
    <section id="home" className="relative min-h-[calc(100svh-80px)] lg:min-h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={data?.image_url || heroMobile}
          alt="Atena School"
          fill
          sizes="100vw"
          className="block sm:hidden object-cover object-[100%_30%] animate-zoom-breathing [will-change:transform]"
          priority
        />
        <Image
          src={data?.image_url || heroDefault}
          alt="Atena School"
          fill
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="hidden sm:block object-cover object-[43%_center] lg:object-center animate-zoom-breathing [will-change:transform]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:from-black/40 lg:via-transparent lg:to-black/20" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/10 top-10 right-10 blur-2xl rounded-full absolute pointer-events-none" />

      {/* Content — vertically centered, left-aligned */}
      <div className="relative z-10 flex-1 flex items-center w-full">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 pt-4 pb-[22svh] sm:pt-0 sm:pb-0 lg:pb-0 min-[1700px]:max-w-[1450px]">
          {/* Content lives in the LEFT ~55% — right side shows the photo */}
          <div className="max-w-[580px] lg:max-w-[620px] xl:max-w-[700px] 2xl:max-w-[950px]">

            {/* Location Pin */}
            <div className="flex items-center gap-1.5 text-[#F8861D] font-bold text-xs uppercase tracking-widest mb-3 sm:mb-6">
              <MapPin size={14} className="text-[#F8861D]" weight="bold" />
              <span>{t("location")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[7.5rem] font-black text-white mb-3 sm:mb-7 uppercase leading-[1.05] drop-shadow-sm">
              {title}
            </h1>

            {/* Divider */}
            <div className="w-12 h-1 bg-[#F8861D] mb-3 sm:mb-7" />

            {/* Subtitle / Tagline */}
            <div className="space-y-1 mb-4 sm:mb-6">
              <p className="font-serif text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl italic text-white/95 leading-relaxed font-bold drop-shadow">
                {tagline}
              </p>
              <p className="text-[10px] sm:text-xs text-[#F8861D] font-bold uppercase tracking-widest pl-1 drop-shadow-sm">
                — {t("author")}
              </p>
            </div>

            {/* Description — hidden on mobile to keep content compact */}
            <p className="hidden sm:block text-white/75 text-sm lg:text-base 2xl:text-lg leading-relaxed mb-8 sm:mb-10">
              Centro autorizzato per la preparazione agli esami Cambridge English e alle certificazioni informatiche EIPASS.
            </p>

            {/* CTA Buttons */}
            {/* Desktop: both buttons */}
            <div className="hidden sm:flex sm:flex-row gap-4">
              <a
                href="#contact"
                className="group inline-flex w-auto items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-7 py-4 rounded-full font-black text-sm lg:text-base transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Prenota una consulenza gratuita
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
              </a>
              <a
                href="#about"
                className="inline-flex w-auto items-center justify-center border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white px-7 py-4 rounded-full font-black text-sm lg:text-base transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Scopri di più
              </a>
            </div>
            {/* Mobile: compact inline button */}
            <a
              href="#contact"
              className="sm:hidden inline-flex items-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-5 py-2.5 rounded-full font-black text-sm shadow-lg shadow-orange-500/30 transition-all active:scale-95 select-none cursor-pointer"
            >
              Prenota ora
              <ArrowRight size={14} weight="bold" />
            </a>

          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/35 animate-bounce pointer-events-none">
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Scorri</span>
        <ArrowDown size={14} weight="bold" />
      </div>
    </section>
  );
};

export default HeroSection;
