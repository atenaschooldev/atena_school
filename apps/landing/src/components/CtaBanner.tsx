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
    <section className="py-6 lg:py-10 px-4 bg-background">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-[#091420] border border-white/5 relative">

        {/* Background image at container level so it covers the whole card and shows behind the orange card's rounded top corners on mobile */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={bannerBg}
            alt="Students studying"
            fill
            className="object-cover object-[center_35%] lg:object-center lg:scale-[1.0] lg:-translate-x-[20%] opacity-75 lg:opacity-95 filter brightness-[0.8] saturate-[0.9] transition-transform duration-500"
            priority
          />
          {/* Gradient overlay adapting to mobile/desktop to keep image visible but text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#091420]/60 via-[#091420]/75 to-[#091420]/85 lg:bg-gradient-to-r lg:from-[#091420]/75 lg:via-[#091420]/35 lg:to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">

          {/* Left Column - Features */}
          <div className="relative lg:col-span-8 p-6 lg:p-8 flex flex-col justify-center min-h-[320px] lg:min-h-[240px]">
            {/* Content */}
            <div className="space-y-5 lg:space-y-4 w-full text-left">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black text-white leading-tight">
                {t("title")}
              </h2>

              {/* Row/Column of features */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-3">
                {features.map((f, index) => {
                  const Icon = f.icon;
                  return (
                    <div key={index} className="flex sm:flex-col lg:flex-row items-center sm:items-start lg:items-center gap-3 sm:gap-2 text-left">
                      {/* Mobile: rounded-full container, Desktop: standard icon color without container */}
                      <div className="text-[#F8861D] shrink-0 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-full border border-white/10 sm:border-none shadow-sm sm:shadow-none flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" weight="light" />
                      </div>
                      <div className="flex flex-col">
                        {/* Mobile: simple text, Desktop: uppercase uppercase tracking-wider leading-none */}
                        <span className="text-sm sm:text-xs font-bold sm:font-black text-white sm:uppercase sm:tracking-wider sm:leading-none">
                          {f.title}
                        </span>
                        <span className="hidden sm:inline-block text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1 leading-none">
                          {t(f.descKey)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Orange CTA with diagonal slash on desktop and rounded top corners on mobile */}
          <div
            className="lg:col-span-5 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[38%] bg-[#F8861D] p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left text-white z-20 min-h-[220px] lg:min-h-0 cta-orange-side"
          >
            {/* Inner wrapper to shift text right and avoid getting clipped */}
            <div className="lg:pl-10 space-y-4">
              <h3 className="font-sans text-base sm:text-lg lg:text-base xl:text-lg font-black leading-tight max-w-[260px] lg:max-w-[220px]">
                {t("cta_title")}
              </h3>
              <p className="text-white/95 text-xs lg:text-[10px] xl:text-xs leading-relaxed max-w-[260px] lg:max-w-[220px] font-medium">
                {t("cta_desc")}
              </p>
              <div className="pt-2 lg:pt-1">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#F8861D] px-6 lg:px-4 py-2.5 lg:py-2 rounded-full font-black text-xs lg:text-[10px] xl:text-xs transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
                >
                  {t("cta_btn")}
                  <ArrowRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>

          {/* Style block for responsive clip-path/rounded corners */}
          <style>{`
            .cta-orange-side {
              clip-path: none;
              border-top-left-radius: 32px;
              border-top-right-radius: 32px;
            }
            @media (min-width: 1024px) {
              .cta-orange-side {
                clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%) !important;
                border-top-left-radius: 0 !important;
                border-top-right-radius: 0 !important;
              }
            }
          `}</style>

        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
