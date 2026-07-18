"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkle, Clock, FileText, GraduationCap } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

// Dynamic import of the main interactive quiz section with deferred loading.
// This splits the JS package and ensures the quiz logic (which has icons/pool data)
// is only downloaded/parsed when the user actually initiates the test.
const EnglishTestQuiz = dynamic(() => import("./EnglishTestQuiz"), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl border border-slate-100/50 shadow-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-[#F8861D] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">
        Caricamento del test...
      </p>
    </div>
  ),
  ssr: false, // Fully dynamic client-side runtime
});

export default function EnglishTest() {
  const t = useTranslations("englishTest");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const startTest = () => {
    // If the browser supports View Transitions, wrap start in transition
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setStarted(true);
      });
    } else {
      setStarted(true);
    }
  };

  const handleRestart = () => {
    // Toggling started triggers a re-mount of EnglishTestQuiz
    // causing questions to reshuffle dynamically.
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setStarted(false);
      });
    } else {
      setStarted(false);
    }
    
    setTimeout(() => {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          setStarted(true);
        });
      } else {
        setStarted(true);
      }
    }, 50);
  };

  // Welcome / Start screen (SSR-rendered immediately for SEO & LCP)
  if (!started) {
    return (
      <div className="w-full max-w-2xl mx-auto relative">
        {/* Ambient background glow for high-end feel */}
        <div className="glow-orb bg-[#043569] w-72 h-72 -top-12 -left-12 opacity-10 blur-3xl pointer-events-none absolute" />
        <div className="glow-orb bg-[#F8861D] w-72 h-72 -bottom-12 -right-12 opacity-10 blur-3xl pointer-events-none absolute" />

        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-[0_20px_50px_rgba(4,53,105,0.04)] p-8 sm:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10">
          
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#F8861D] bg-orange-50 border border-orange-100 rounded-full mb-6 select-none">
            <Sparkle size={10} weight="fill" className="animate-pulse" />
            Valutazione Rapida
          </span>

          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#043569] leading-tight mb-4 tracking-tight">
            {t("title")}
          </h1>
          
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {t("subtitle")}
          </p>

          {/* Quick test metadata grid for CRO */}
          <div className="flex justify-center items-center gap-5 sm:gap-8 my-8 text-xs font-bold text-slate-500 border-t border-b border-slate-100/80 py-4 max-w-md mx-auto select-none">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-[#F8861D]" weight="bold" />
              <span>~2 Minuti</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={16} className="text-[#F8861D]" weight="bold" />
              <span>10 Domande</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap size={16} className="text-[#F8861D]" weight="bold" />
              <span>CEFR Level</span>
            </div>
          </div>

          <button
            onClick={startTest}
            className="group inline-flex items-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-8 py-4 rounded-full font-black text-sm sm:text-base transition-all duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
          >
            {t("btnStart")}
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  // Active Dynamic Quiz (Loads deferred js chunk)
  return <EnglishTestQuiz onRestart={handleRestart} />;
}
