"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, ArrowRight, Star, CheckCircle, ShieldCheck, Trophy, GraduationCap, Users, Clock } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";

import studentImg from "@/assets/hero.webp";
import { HeroData } from "@/features/home/services/homeService";

interface HeroSectionProps {
  data?: HeroData;
}

const HeroSection = ({ data }: HeroSectionProps) => {
  const t = useTranslations("hero");

  return (
    <section id="home" className="relative min-h-[calc(100dvh-56px)] lg:h-dvh w-full flex flex-col justify-between overflow-hidden bg-slate-50/70 pt-20 sm:pt-24 lg:pt-20 [@media(min-width:1024px)_and_(min-height:850px)]:pt-28 pb-8 lg:pb-3 sm:pb-4 [@media(min-width:1024px)_and_(min-height:850px)]:pb-8">

      {/* Subtle Background Radial Ambient Glows */}
      <div className="absolute top-0 right-0 w-[450px] [@media(min-width:1024px)_and_(min-height:850px)]:w-[800px] h-[450px] [@media(min-width:1024px)_and_(min-height:850px)]:h-[800px] bg-[#F8861D]/10 rounded-full blur-[100px] [@media(min-width:1024px)_and_(min-height:850px)]:blur-[160px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] [@media(min-width:1024px)_and_(min-height:850px)]:w-[800px] h-[450px] [@media(min-width:1024px)_and_(min-height:850px)]:h-[800px] bg-[#043569]/10 rounded-full blur-[100px] [@media(min-width:1024px)_and_(min-height:850px)]:blur-[160px] pointer-events-none -z-0" />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [@media(min-width:1024px)_and_(min-height:850px)]:bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,transparent_80px,black_130px)] pointer-events-none -z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 flex-1 flex flex-col justify-start lg:justify-between py-2 sm:py-3 min-h-0">

        {/* MOBILE ONLY LAYOUT (< lg) */}
        <div className="lg:hidden flex flex-col justify-between gap-4 py-2 flex-1">

          {/* Top row: Text (Left) + Student Image (Right) */}
          <div className="flex flex-row items-stretch gap-3">
            {/* Left Column: Heading & Info */}
            <div className="flex-1 space-y-2.5 text-left">
              {/* Location Badge Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/90 text-[10px] sm:text-xs font-bold text-slate-600 tracking-wider uppercase shadow-2xs">
                <MapPin size={13} className="text-[#F8861D] shrink-0" weight="bold" />
                <span>A CITTANOVA (RC) • IN SEDE E ONLINE</span>
              </div>

              {/* Main Heading H1 */}
              <h1 className="font-serif text-[1.65rem] xs:text-[1.8rem] sm:text-3xl font-black text-[#043569] leading-[1.1] tracking-tight">
                Corsi di Lingua e Certificazioni in Presenza e Online
              </h1>

              {/* Description Subtitle */}
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Con <strong className="font-extrabold text-[#043569]">ATENA <span className="text-[#F8861D]">SCHOOL</span></strong> impara l&apos;inglese, preparati agli esami <strong className="font-bold text-[#D9232D]">Cambridge University</strong> e <strong className="font-bold text-[#6C207E]">Trinity College</strong> ed ottieni certificazioni ufficiali <strong className="font-bold text-[#0056B3]">EIPASS</strong>.
              </p>

              <p className="text-slate-500 text-[11px] sm:text-xs font-medium leading-relaxed">
                Percorsi riconosciuti per scuola, università e lavoro — in sede e online in tutta Italia.
              </p>
            </div>

            {/* Right Column: Student Image Cutout */}
            <div className="w-[145px] xs:w-[170px] sm:w-[210px] shrink-0 relative flex items-end justify-center self-end">
              {/* Background dot grid pattern effect */}
              <div className="absolute top-2 right-0 w-20 h-20 bg-[radial-gradient(#f8861d33_1.5px,transparent_1.5px)] bg-[size:8px_8px] pointer-events-none" />
              <Image
                src={studentImg}
                alt="Studente Atena School"
                width={400}
                height={520}
                className="object-contain max-h-[260px] xs:max-h-[290px] sm:max-h-[340px] w-auto relative z-10 drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 my-1">
            {/* Card 1: Cambridge */}
            <Link href="#corsi" className="bg-white/95 border border-slate-200/80 shadow-sm rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center group hover:border-orange-300 transition-all">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 mb-1.5">
                <ShieldCheck size={16} weight="bold" className="text-[#F8861D]" />
              </div>
              <p className="text-[11px] sm:text-xs font-black text-[#043569] leading-tight">Centro Cambridge</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">KET, PET, FCE</p>
            </Link>

            {/* Card 2: EIPASS */}
            <Link href="#corsi" className="bg-white/95 border border-slate-200/80 shadow-sm rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center group hover:border-blue-300 transition-all">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 mb-1.5">
                <GraduationCap size={16} weight="fill" className="text-[#043569]" />
              </div>
              <p className="text-[11px] sm:text-xs font-black text-[#043569] leading-tight">Certificazioni EIPASS</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">Moduli, Coding &amp; IT</p>
            </Link>

            {/* Card 3: Madrelingua */}
            <Link href="#contatti" className="bg-white/95 border border-slate-200/80 shadow-sm rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center group hover:border-emerald-300 transition-all">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 mb-1.5">
                <Star size={16} weight="fill" className="text-emerald-600" />
              </div>
              <p className="text-[11px] sm:text-xs font-black text-[#043569] leading-tight">Docenti Madrelingua</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">Tutor qualificati</p>
            </Link>

            {/* Card 4: Per tutte le età */}
            <a href="#contatti" className="bg-white/95 border border-slate-200/80 shadow-sm rounded-xl p-2.5 sm:p-3 flex flex-col items-center text-center group hover:border-amber-300 transition-all">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 mb-1.5">
                <Users size={16} weight="fill" className="text-amber-600" />
              </div>
              <p className="text-[11px] sm:text-xs font-black text-[#043569] leading-tight">Per tutte le età</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">Bambini e adulti</p>
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2.5 my-1">
            <a
              href="#contatti"
              className="group inline-flex items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-6 py-3.5 rounded-full font-black text-sm transition-all duration-300 shadow-md shadow-orange-500/20 active:translate-y-0 cursor-pointer"
            >
              Prenota una consulenza gratuita
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
            </a>
            <Link
              href="/test-inglese"
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#043569] border border-[#043569]/80 px-6 py-3.5 rounded-full font-extrabold text-sm transition-all duration-300 shadow-sm active:translate-y-0 cursor-pointer"
            >
              Testa il tuo inglese ⚡
            </Link>
          </div>

          {/* Benefits Card Container */}
          <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-around text-xs text-slate-700 font-bold shadow-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-[#043569]" weight="bold" />
              <span>Esami in sede</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-[#043569]" weight="bold" />
              <span>Gruppi ridotti</span>
            </div>
            <div className="h-3.5 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-[#043569]" weight="bold" />
              <span>Orari flessibili</span>
            </div>
          </div>

        </div>

        {/* DESKTOP LAYOUT (>= lg) */}
        <div className="hidden lg:grid grid-cols-12 gap-8 [@media(min-width:1024px)_and_(min-height:850px)]:gap-16 items-center my-auto">

          {/* Left Column: Offer & CTAs */}
          <div className="col-span-7 space-y-4 [@media(min-width:1024px)_and_(min-height:850px)]:space-y-8 text-left">

            {/* Top Rating & Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 [@media(min-width:1024px)_and_(min-height:850px)]:px-5 [@media(min-width:1024px)_and_(min-height:850px)]:py-2.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs [@media(min-width:1024px)_and_(min-height:850px)]:text-sm font-bold text-slate-800 select-none">
              <div className="flex items-center text-amber-400 gap-0.5">
                <Star size={13} className="[@media(min-width:1024px)_and_(min-height:850px)]:hidden" weight="fill" />
                <Star size={16} className="hidden [@media(min-width:1024px)_and_(min-height:850px)]:block" weight="fill" />
                <Star size={13} className="[@media(min-width:1024px)_and_(min-height:850px)]:hidden" weight="fill" />
                <Star size={16} className="hidden [@media(min-width:1024px)_and_(min-height:850px)]:block" weight="fill" />
                <Star size={13} className="[@media(min-width:1024px)_and_(min-height:850px)]:hidden" weight="fill" />
                <Star size={16} className="hidden [@media(min-width:1024px)_and_(min-height:850px)]:block" weight="fill" />
                <Star size={13} className="[@media(min-width:1024px)_and_(min-height:850px)]:hidden" weight="fill" />
                <Star size={16} className="hidden [@media(min-width:1024px)_and_(min-height:850px)]:block" weight="fill" />
                <Star size={13} className="[@media(min-width:1024px)_and_(min-height:850px)]:hidden" weight="fill" />
                <Star size={16} className="hidden [@media(min-width:1024px)_and_(min-height:850px)]:block" weight="fill" />
              </div>
              <span className="font-black text-[#043569] text-xs [@media(min-width:1024px)_and_(min-height:850px)]:text-base">4.9 / 5</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-[11px] [@media(min-width:1024px)_and_(min-height:850px)]:text-sm">
                <span className="text-[#D9232D]">Cambridge</span>, <span className="text-[#6C207E]">Trinity</span> &amp; <span className="text-[#0056B3]">EIPASS</span>
              </span>
            </div>

            {/* Main Heading H1 */}
            <div className="space-y-2 [@media(min-width:1024px)_and_(min-height:850px)]:space-y-4">
              <div className="flex items-center gap-1.5 text-xs [@media(min-width:1024px)_and_(min-height:850px)]:text-sm font-semibold uppercase tracking-widest text-slate-600">
                <MapPin size={16} className="text-[#F8861D] shrink-0" weight="bold" />
                <span>Cittanova (RC) • In Presenza e Online</span>
              </div>
              <h1 className="font-serif text-3xl lg:text-4xl xl:text-5xl [@media(min-width:1024px)_and_(min-height:850px)]:text-[4.75rem] font-black text-[#043569] leading-[1.08] tracking-tight">
                Corsi di Lingua e Certificazioni in Presenza e Online
              </h1>
            </div>

            {/* Subtitle / Description */}
            <p className="text-slate-600 text-sm lg:text-base xl:text-lg [@media(min-width:1024px)_and_(min-height:850px)]:text-2xl font-medium leading-relaxed max-w-2xl [@media(min-width:1024px)_and_(min-height:850px)]:max-w-4xl">
              Con <strong className="font-extrabold text-[#043569]">ATENA <span className="text-[#F8861D]">SCHOOL</span></strong> impara l&apos;inglese, preparati agli esami <strong className="font-bold text-[#D9232D]">Cambridge University</strong> e <strong className="font-bold text-[#6C207E]">Trinity College</strong> ed ottieni certificazioni ufficiali <strong className="font-bold text-[#0056B3]">EIPASS</strong>. Percorsi riconosciuti per scuola, università e lavoro — in sede e online in tutta&nbsp;Italia.
            </p>

            {/* CTA Buttons */}
            <div className="pt-0.5 flex flex-row items-center gap-3.5 [@media(min-width:1024px)_and_(min-height:850px)]:gap-4">
              <a
                href="#contatti"
                className="group inline-flex items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-6 py-3 [@media(min-width:1024px)_and_(min-height:850px)]:px-7 [@media(min-width:1024px)_and_(min-height:850px)]:py-3.5 rounded-full font-extrabold text-sm [@media(min-width:1024px)_and_(min-height:850px)]:text-base transition-all duration-300 shadow-md [@media(min-width:1024px)_and_(min-height:850px)]:shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Prenota una consulenza gratuita
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" weight="bold" />
              </a>
              <Link
                href="/test-inglese"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-[#043569] border border-slate-200/80 px-6 py-3 [@media(min-width:1024px)_and_(min-height:850px)]:px-6 [@media(min-width:1024px)_and_(min-height:850px)]:py-3.5 rounded-full font-extrabold text-sm [@media(min-width:1024px)_and_(min-height:850px)]:text-base transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
              >
                Testa il tuo inglese ⚡
              </Link>
            </div>

            {/* Quick Benefits Bullet Points */}
            <div className="flex flex-wrap items-center justify-start gap-6 [@media(min-width:1024px)_and_(min-height:850px)]:gap-8 text-xs [@media(min-width:1024px)_and_(min-height:850px)]:text-base text-slate-500 font-bold select-none">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={18} className="text-[#F8861D]" weight="fill" />
                <span>Esami in sede</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={18} className="text-[#F8861D]" weight="fill" />
                <span>Gruppi ridotti</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={18} className="text-[#F8861D]" weight="fill" />
                <span>Orari flessibili</span>
              </div>
            </div>

          </div>

          {/* Right Column: Pop-out Design */}
          <div className="col-span-5 relative flex justify-center items-end pt-14 sm:pt-20 [@media(min-width:1024px)_and_(min-height:850px)]:pt-24">

            {/* Badge 1 — Cambridge */}
            <Link
              href="#corsi"
              className="absolute top-[10%] left-0 z-30 animate-float group"
              style={{ animationDelay: '0s' }}
            >
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg rounded-xl px-2.5 py-2 flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                  <ShieldCheck size={13} weight="bold" className="text-[#F8861D]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#043569] leading-none whitespace-nowrap">Centro Cambridge</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 whitespace-nowrap">KET, PET, FCE</p>
                </div>
              </div>
            </Link>

            {/* Badge 2 — EIPASS */}
            <Link
              href="#corsi"
              className="absolute top-[6%] right-0 z-30 animate-breathe group"
              style={{ animationDelay: '1s' }}
            >
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg rounded-xl px-2.5 py-2 flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <GraduationCap size={13} weight="fill" className="text-[#043569]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#043569] leading-none whitespace-nowrap">Certificazioni EIPASS</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 whitespace-nowrap">7 Moduli, Coding &amp; IT</p>
                </div>
              </div>
            </Link>

            {/* Badge 3 — Madrelingua */}
            <Link
              href="#contatti"
              className="absolute bottom-[40%] right-0 z-30 animate-float group"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg rounded-xl px-2.5 py-2 flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Star size={13} weight="fill" className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#043569] leading-none whitespace-nowrap">Docenti Madrelingua</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 whitespace-nowrap">Tutor qualificati</p>
                </div>
              </div>
            </Link>

            {/* Badge 4 — Per tutte le età */}
            <a
              href="#contatti"
              className="absolute bottom-[8%] left-0 z-30 animate-breathe group"
              style={{ animationDelay: '1.8s' }}
            >
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-lg rounded-xl px-2.5 py-2 flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <Trophy size={13} weight="fill" className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#043569] leading-none whitespace-nowrap">Per tutte le età</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5 whitespace-nowrap">Bambini e adulti</p>
                </div>
              </div>
            </a>

            {/* Background Card */}
            <div className="w-[280px] h-[255px] lg:w-[320px] lg:h-[295px] xl:w-[360px] xl:h-[330px] [@media(min-width:1024px)_and_(min-height:850px)]:w-[510px] [@media(min-width:1024px)_and_(min-height:850px)]:h-[470px] bg-gradient-to-br from-[#043569] via-[#0052cc] to-[#043569] rounded-[3rem] border border-white/20 shadow-2xl shadow-blue-950/40 relative translate-x-3 lg:translate-x-4 [@media(min-width:1024px)_and_(min-height:850px)]:translate-x-6">
              <div className="absolute top-4 right-4 w-28 h-28 bg-[radial-gradient(#ffffff33_1.5px,transparent_1.5px)] bg-[size:10px_10px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F8861D]/25 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Student Cutout */}
            <div className="absolute bottom-0 z-20 w-full max-w-[340px] lg:max-w-[380px] xl:max-w-[420px] [@media(min-width:1024px)_and_(min-height:850px)]:max-w-[620px] flex justify-center pointer-events-none -translate-x-4 lg:-translate-x-5 [@media(min-width:1024px)_and_(min-height:850px)]:-translate-x-8">
              <Image
                src={studentImg}
                alt="Studente Atena School"
                width={800}
                height={960}
                className="object-contain max-h-[430px] lg:max-h-[490px] xl:max-h-[540px] [@media(min-width:1024px)_and_(min-height:850px)]:max-h-[740px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 duration-700 pointer-events-auto"
                priority
              />
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default HeroSection;

