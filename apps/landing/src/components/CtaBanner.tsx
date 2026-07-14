"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Users, CheckCircle, Certificate, Headset, ArrowRight } from "@phosphor-icons/react";
import bannerBg from "@/assets/cta-banner-bg.png";

const CtaBanner = () => {
  const t = useTranslations("ctaBanner");

  const features = [
    {
      icon: Users,
      title: t("feature_1_title"),
      desc: f => t("feature_1_desc"), // Wait, we can just use the key directly or translate
      descKey: "feature_1_desc",
    },
    {
      icon: CheckCircle,
      title: t("feature_2_title"),
      descKey: "feature_2_desc",
    },
    {
      icon: Certificate,
      title: t("feature_3_title"),
      descKey: "feature_3_desc",
    },
    {
      icon: Headset,
      title: t("feature_4_title"),
      descKey: "feature_4_desc",
    },
  ];

  return (
    <section className="py-10 px-4 bg-background">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 relative">
          
          {/* Left Column - Features & Image Background */}
          <div className="relative lg:col-span-8 p-5 sm:p-8 flex flex-col justify-center overflow-hidden min-h-[200px] lg:min-h-[240px] z-10">
            {/* Background image with overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={bannerBg}
                alt="Students studying"
                fill
                className="object-cover object-center opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-[#043569]/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-5 w-full">
              <h2 className="font-serif text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight text-left">
                {t("title")}
              </h2>

              {/* Row of features */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {features.map((f, index) => {
                  const Icon = f.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-left">
                      <div className="text-[#F8861D] shrink-0">
                        <Icon size={22} weight="light" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider leading-none">
                          {f.title}
                        </span>
                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1 leading-none">
                          {t(f.descKey)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Orange CTA with diagonal slash */}
          <div 
            className="lg:col-span-5 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[38%] bg-[#F8861D] p-5 sm:p-8 flex flex-col justify-center text-left text-white z-20 min-h-[200px] lg:min-h-0"
            style={{
              clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
            }}
          >
            {/* Inner wrapper to shift text right and avoid getting clipped */}
            <div className="lg:pl-10 space-y-3">
              <h3 className="font-sans text-sm sm:text-base font-bold leading-tight max-w-[220px]">
                {t("cta_title")}
              </h3>
              <p className="text-white/90 text-[10px] sm:text-[11px] leading-relaxed max-w-[220px] font-medium">
                {t("cta_desc")}
              </p>
              <div className="pt-1">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#F8861D] px-4 py-2 rounded-full font-black text-[10px] sm:text-xs transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
                >
                  {t("cta_btn")}
                  <ArrowRight size={12} weight="bold" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
