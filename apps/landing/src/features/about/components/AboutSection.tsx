"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Cube, Users, ShieldCheck } from "@phosphor-icons/react";
import aboutStudent from "@/assets/about-student.webp";
import aboutStudying from "@/assets/about-studying.webp";
import aboutClassroom from "@/assets/about-classroom.webp";

interface AboutSectionProps {
  data?: any;
}

const AboutSection = ({ data }: AboutSectionProps) => {
  const t = useTranslations("about");

  const p1 = data?.content_it || t("p1");
  const p2 = data?.content_it || t("p2");

  const highlights = [
    {
      icon: Cube,
      title: "Metodologia",
      desc: "efficace",
    },
    {
      icon: Users,
      title: "Docenti",
      desc: "qualificati",
    },
    {
      icon: ShieldCheck,
      title: "Ambiente",
      desc: "stimolante",
    },
  ];

  return (
    <section id="about" className="relative pt-16 pb-20 bg-gray-50 overflow-hidden px-0 min-h-screen flex flex-col justify-center">
      {/* Decorative background accents */}
      <div className="absolute top-1/4 left-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">

          {/* Left Column: Text & Features */}
          <div 
            className="lg:col-span-6 space-y-5 flex flex-col items-start text-left h-fit self-center px-4 sm:px-6 lg:pl-16 lg:pr-12 xl:pl-28 2xl:pl-40" 
            data-gsap="fade-up"
          >
            <div className="space-y-3.5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F8861D]">
                CHI SIAMO
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#043569] leading-tight">
                Unire la ricchezza della cultura classica con il mondo moderno e le sue sfide.
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest leading-none pt-1">
                — ELISABETTA & MARIA, FONDATRICI
              </p>
            </div>

            {/* Description Text */}
            <div className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed space-y-5 font-medium max-w-xl">
              <p>{p1}</p>
              <p>{p2}</p>
            </div>

            {/* Highlight Badges */}
            <div className="grid grid-cols-3 gap-6 w-full pt-6 border-t border-gray-100">
              {highlights.map((hl, index) => {
                const Icon = hl.icon;
                return (
                  <div key={index} className="flex flex-col items-start gap-2.5">
                    <div className="text-[#043569]">
                      <Icon size={28} weight="light" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm lg:text-base font-black text-gray-800 leading-none">
                        {hl.title}
                      </span>
                      <span className="text-xs font-bold text-gray-500 mt-1 leading-none">
                        {hl.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3-Image Collage & Dots */}
          <div 
            className="lg:col-span-6 mt-8 lg:mt-0 w-full pl-4 pr-4 lg:pl-8 lg:pr-12 xl:pr-20 2xl:pr-32" 
            data-gsap="fade-up" 
            data-gsap-delay="100"
          >
            {/* Image Grid with bottom alignment and offset */}
            <div className="grid grid-cols-2 gap-4 items-stretch max-w-xl lg:max-w-none ml-auto lg:ml-0">

              {/* Left Column of Collage */}
              <div className="flex flex-col gap-4">
                {/* Image 1 - Student holding book */}
                <div className="relative rounded-3xl overflow-hidden shadow-md aspect-[4/5] w-full transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg [will-change:transform,box-shadow] cursor-pointer">
                  <Image
                    src={aboutStudent}
                    alt="Student holding notebook"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Image 2 - Girls studying */}
                <div className="relative rounded-3xl overflow-hidden shadow-md aspect-[4/3] w-full transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg [will-change:transform,box-shadow] cursor-pointer">
                  <Image
                    src={aboutStudying}
                    alt="Students studying together"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right Column of Collage */}
              <div className="relative flex flex-col h-full">
                {/* Decorative Dot Grid Pattern */}
                <div className="absolute -top-4 -right-4 w-24 h-24 pointer-events-none text-[#F8861D]/25 z-0">
                  <svg width="100%" height="100%" fill="currentColor">
                    <pattern id="dot-grid-about" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="2" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dot-grid-about)" />
                  </svg>
                </div>

                {/* Image 3 - Teacher in classroom */}
                <div className="relative flex-1 rounded-3xl overflow-hidden shadow-md w-full min-h-[280px] z-10 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg [will-change:transform,box-shadow] cursor-pointer">
                  <Image
                    src={aboutClassroom}
                    alt="Teacher in classroom"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
