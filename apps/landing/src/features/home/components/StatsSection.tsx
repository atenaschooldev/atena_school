"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Users, CheckCircle, TrendUp, Trophy } from "@phosphor-icons/react";
import Image from "next/image";
import cambridgeLogo from "@/assets/cambridge.webp";
import eipassLogo from "@/assets/eipass_logo.webp";
import trinityLogo from "@/assets/trinity_transparent.webp";
import LogoLoop, { LogoItem } from "@/components/ui/LogoLoop";
import { brandConfig } from "@/config/brand.config";

type StatItem =
  | { type: "icon"; icon: React.ElementType; value: string; label: string }
  | { type: "logo"; src: typeof cambridgeLogo; alt: string; label: string; href?: string; filter?: string; height?: number; scale?: number; bg?: boolean };

const StatsSection = () => {
  const t = useTranslations("stats");

  const logoItems: LogoItem[] = useMemo(() => {
    const stats: StatItem[] = [
      { type: "icon", icon: Users, value: t("students_val"), label: t("students_lbl") },
      { type: "icon", icon: CheckCircle, value: t("pass_rate_val"), label: t("pass_rate_lbl") },
      ...(brandConfig.features.enableAccreditations
        ? [{ type: "logo" as const, src: cambridgeLogo, alt: "Cambridge English", label: "Preparazione Esami", href: "https://www.cambridgeenglish.org/", height: 48, scale: 1.5 }]
        : []),
      { type: "icon", icon: TrendUp, value: t("experience_val"), label: t("experience_lbl") },
      ...(brandConfig.features.enableAccreditations
        ? [{ type: "logo" as const, src: trinityLogo, alt: "Trinity College London", label: "Registered Exam Centre", href: "https://www.trinitycollege.it", filter: "brightness(0) invert(1)", height: 36, scale: 1.5 }]
        : []),
      { type: "icon", icon: Trophy, value: t("certifications_val"), label: t("certifications_lbl") },
      ...(brandConfig.features.enableAccreditations
        ? [{ type: "logo" as const, src: eipassLogo, alt: "EIPASS", label: "Centro autorizzato", href: "https://it.eipass.com/", filter: "brightness(0) invert(1)", height: 32, scale: 1.2 }]
        : []),
    ];

    return stats.map((stat) => ({
      href: stat.type === "logo" ? stat.href : undefined,
      title: stat.type === "logo" ? stat.alt : undefined,
      node: (
        <div className="inline-flex items-center gap-4 px-6 shrink-0">
          {stat.type === "icon" ? (
            <>
              <stat.icon size={18} weight="bold" className="text-secondary shrink-0" />
              <span className="font-black text-base uppercase tracking-widest text-white">{stat.value}</span>
              <span className="text-white text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            </>
          ) : (
            <>
              <div
                className={`flex items-center justify-center shrink-0 h-9 px-2.5 py-1 rounded-lg ${stat.bg ? "bg-white shadow-sm overflow-hidden" : ""
                  }`}
              >
                <Image
                  src={stat.src}
                  alt={stat.alt}
                  height={stat.height ?? 32}
                  className="max-h-full w-auto object-contain shrink-0"
                  style={{
                    ...(stat.filter ? { filter: stat.filter } : {}),
                    ...(stat.scale ? { transform: `scale(${stat.scale})`, transformOrigin: "center" } : {}),
                  }}
                />
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-widest pl-1">{stat.label}</span>
            </>
          )}
          <span className="text-white/20 ml-6 text-lg">•</span>
        </div>
      ),
    }));
  }, [t]);

  if (!brandConfig.features.enableStatsBanner) {
    return null;
  }

  return (
    <div className="relative z-30 w-full bg-primary-dark overflow-hidden border-y border-white/10 py-4">
      <LogoLoop
        logos={logoItems}
        speed={60}
        direction="left"
        gap={0}
        hoverSpeed={0}
        fadeOut
        ariaLabel="Statistiche e Accreditamenti"
      />
    </div>
  );
};

export default StatsSection;
