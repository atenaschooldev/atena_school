"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, ArrowRight, ArrowDown, Sparkle } from "@phosphor-icons/react";
import heroDefault from "@/assets/hero-london.avif";
import heroMobile from "@/assets/hero-london-mobile.avif";
import { Link } from "@/i18n/routing";


import { HeroData } from "@/features/home/services/homeService";

interface HeroSectionProps {
  data?: HeroData;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");

  const title = data?.title || t("title");
  const tagline = data?.tagline || t("tagline");

  return (
    <section id="home" className="relative min-h-svh lg:min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={data?.imageUrl || heroMobile}
          alt="Atena School"
          fill
          sizes="100vw"
          className="block sm:hidden object-cover object-[100%_30%] animate-zoom-breathing [will-change:transform]"
          priority
        />
        <Image
          src={data?.imageUrl || heroDefault}
          alt="Atena School"
          fill
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="hidden sm:block object-cover object-[43%_center] lg:object-center animate-zoom-breathing [will-change:transform]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent lg:from-black/40 lg:via-transparent lg:to-black/20" />
      </div>

      {/* Decorative glowing orbs */}
      <div className="glow-orb w-[400px] h-[400px] bg-primary/10 top-10 right-10 blur-2xl rounded-full absolute pointer-events-none" />

      {/* Content — vertically centered, left-aligned */}
      <div className="relative z-10 flex-1 flex items-center w-full">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 pt-4 pb-[22svh] sm:pt-0 sm:pb-0 lg:pb-0">
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
            <div className="hidden sm:flex sm:flex-row items-center gap-3 lg:gap-4">
              <a
                href="#contact"
                className="group inline-flex w-auto items-center justify-center gap-2 bg-white hover:bg-gray-50 text-black px-5 py-3 lg:px-6 lg:py-3.5 rounded-full font-black text-xs lg:text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Prenota una consulenza gratuita
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
              </a>
              <Link
                href="/test-inglese"
                className="inline-flex w-auto items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 lg:px-6 lg:py-3.5 rounded-full font-black text-xs lg:text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Testa il tuo inglese ⚡
              </Link>
            </div>
            {/* Mobile: compact inline buttons aligned to start so they don't stretch */}
            <div className="sm:hidden flex flex-col items-start gap-2.5 w-full">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-black px-10 py-2.5 rounded-full font-black text-xs shadow-md transition-all active:scale-95 select-none cursor-pointer self-start min-w-[210px]"
              >
                Prenota ora
                <ArrowRight size={12} weight="bold" />
              </a>
              <Link
                href="/test-inglese"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full font-black text-xs transition-all active:scale-95 select-none cursor-pointer self-start"
              >
                Testa il tuo inglese ⚡
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
