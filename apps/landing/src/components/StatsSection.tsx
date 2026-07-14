"use client";

import { useTranslations } from "next-intl";
import { Users, CheckCircle, TrendUp, Trophy } from "@phosphor-icons/react";

const StatsSection = () => {
  const t = useTranslations("stats");

  const stats = [
    {
      icon: Users,
      value: t("students_val"),
      label: t("students_lbl"),
    },
    {
      icon: CheckCircle,
      value: t("pass_rate_val"),
      label: t("pass_rate_lbl"),
    },
    {
      icon: TrendUp,
      value: t("experience_val"),
      label: t("experience_lbl"),
    },
    {
      icon: Trophy,
      value: t("certifications_val"),
      label: t("certifications_lbl"),
    },
  ];

  return (
    <div className="relative z-30 max-w-6xl mx-auto px-4 -mt-12 sm:-mt-16">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 text-left"
              >
                {/* Circular Badge */}
                <div className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-100 bg-white text-[#F8861D] shadow-sm shrink-0">
                  <Icon size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-black text-2xl md:text-3xl text-gray-900 tracking-tight leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500 mt-1 leading-tight">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
