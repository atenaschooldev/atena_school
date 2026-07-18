"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

// Dynamic import of the main interactive quiz section with deferred loading.
// This splits the JS package and ensures the quiz logic (which has icons/pool data)
// is only downloaded/parsed when the user actually initiates the test.
const EnglishTestQuiz = dynamic(() => import("./EnglishTestQuiz"), {
  loading: () => (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-12 text-center">
      <div className="w-8 h-8 border-4 border-[#F8861D] border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  ),
  ssr: false, // Fully dynamic client-side runtime
});

export default function EnglishTest() {
  const t = useTranslations("englishTest");
  const [started, setStarted] = useState(false);

  const startTest = () => {
    setStarted(true);
  };

  const handleRestart = () => {
    // Toggling started triggers a re-mount of EnglishTestQuiz
    // causing questions to reshuffle dynamically.
    setStarted(false);
    setTimeout(() => {
      setStarted(true);
    }, 50);
  };

  // Welcome / Start screen (SSR-rendered immediately for SEO & LCP)
  if (!started) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-16 h-16 bg-[#F8861D]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F8861D]">
          <Sparkle size={32} weight="fill" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#043569] leading-tight mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
          {t("subtitle")}
        </p>
        <button
          onClick={startTest}
          className="inline-flex items-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-8 py-4 rounded-full font-black text-sm sm:text-base transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
        >
          {t("btnStart")}
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    );
  }

  // Active Dynamic Quiz (Loads deferred js chunk)
  return <EnglishTestQuiz onRestart={handleRestart} />;
}
