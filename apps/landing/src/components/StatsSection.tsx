"use client";

import { useTranslations } from "next-intl";
import { Users, CheckCircle, TrendUp, Trophy } from "@phosphor-icons/react";
import Image from "next/image";
import cambridgeLogo from "@/assets/cambridge.webp";
import eipassLogo from "@/assets/eipass_logo.webp";

type StatItem =
  | { type: "icon"; icon: React.ElementType; value: string; label: string }
  | { type: "logo"; src: typeof cambridgeLogo; alt: string; label: string; filter?: string; height?: number; scale?: number };

const StatsSection = () => {
  const t = useTranslations("stats");

  const stats: StatItem[] = [
    { type: "icon", icon: Users,       value: t("students_val"),       label: t("students_lbl") },
    { type: "icon", icon: CheckCircle, value: t("pass_rate_val"),      label: t("pass_rate_lbl") },
    { type: "logo", src: cambridgeLogo, alt: "Cambridge English", label: "Preparazione Esami", height: 48, scale: 1.5 },
    { type: "icon", icon: TrendUp,     value: t("experience_val"),     label: t("experience_lbl") },
    { type: "icon", icon: Trophy,      value: t("certifications_val"), label: t("certifications_lbl") },
    { type: "logo", src: eipassLogo,   alt: "EIPASS",           label: "Centro autorizzato", filter: "brightness(0) invert(1)" },
  ];

  const renderItem = (stat: StatItem, key: string) => (
    <div key={key} className="inline-flex items-center gap-3 px-10 shrink-0">
      {stat.type === "icon" ? (
        <>
          <stat.icon size={18} weight="bold" className="text-[#FAA904] shrink-0" />
          <span className="font-black text-base uppercase tracking-widest text-white">{stat.value}</span>
          <span className="text-white text-xs font-bold uppercase tracking-widest">{stat.label}</span>
        </>
      ) : (
        <>
          <Image
            src={stat.src}
            alt={stat.alt}
            height={stat.height ?? 32}
            className="object-contain shrink-0"
            style={{
              ...(stat.filter ? { filter: stat.filter } : {}),
              ...(stat.scale ? { transform: `scale(${stat.scale})`, transformOrigin: "center" } : {}),
            }}
          />
          <span className="text-white text-xs font-bold uppercase tracking-widest">{stat.label}</span>
        </>
      )}
      <span className="text-white/20 ml-6 text-lg">•</span>
    </div>
  );

  return (
    <div className="relative z-30 w-full bg-[#00328F] overflow-hidden border-y border-white/10 py-4">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-[#00328F] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-[#00328F] to-transparent" />

      <div className="w-full overflow-hidden">
        <div
          style={{
            display: "inline-flex",
            whiteSpace: "nowrap",
            animation: "stats-ticker 14s linear infinite",
            willChange: "transform",
          }}
        >
          {stats.map((stat, i) => renderItem(stat, `a-${i}`))}
          {stats.map((stat, i) => renderItem(stat, `b-${i}`))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
