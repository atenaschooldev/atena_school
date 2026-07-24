"use client";

import { useTranslations } from "next-intl";
import { CalendarCheck, CaretRight } from "@phosphor-icons/react";

const BookingSection = () => {
  const t = useTranslations("booking");

  return (
    <section id="booking" className="py-12 px-4 bg-primary/5 relative overflow-hidden">
      {/* Decorative blurry shapes */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center p-4 bg-background rounded-2xl shadow-sm mb-8">
          <CalendarCheck className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-6">
          {t("title")}
        </h2>
        
        <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-10 max-w-2xl mx-auto">
          {t("description")}
        </p>

        <a 
          href="#contatti" 
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 group"
        >
          {t("cta")}
          <CaretRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </section>
  );
};

export default BookingSection;
