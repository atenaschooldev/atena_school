"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import heroDefault from "@/assets/hero-london.webp";

const CoursesHero = () => {
  const t = useTranslations("coursesPage");

  return (
    <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroDefault}
          alt="Atena School Courses"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight"
        >
          {t("title")}
        </h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-6" />
        <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto italic">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
};

export default CoursesHero;
