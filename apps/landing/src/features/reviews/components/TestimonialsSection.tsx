"use client";

import { useTranslations, useLocale } from "next-intl";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface Testimonial {
  id?: string;
  quote_it?: string;
  quote_en?: string;
  author?: string;
  role_it?: string;
  role_en?: string;
  avatar_url?: string;
}

interface TestimonialsSectionProps {
  data?: any[];
}

const FALLBACK_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", // Female
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", // Male
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", // Female 2
];

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback to translations if no data provided
  const testimonials = data && data.length > 0 ? data : (t.raw("list") as any[]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();

    emblaApi.on("select", onSelect);
    
    // Auto-play logic
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 8000);

    return () => {
      clearInterval(intervalId);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-8 sm:py-10 px-4 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-12 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-2xl mx-auto relative z-20">
        {/* Section Header */}
        <div className="text-center mb-6 px-4 space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F8861D]">
            COSA DICONO DI NOI
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#043569]">
            {t("title")}
          </h2>
        </div>

        <div className="relative group px-4 sm:px-12">
          {/* Carousel Viewport */}
          <div 
            className="overflow-hidden" 
            ref={emblaRef}
          >
            <div className="flex items-stretch">
              {testimonials.map((item, index) => {
                const avatar = item.avatar_url || FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
                const quoteText = item[`quote_${locale}`] || item.quote || item.content_it || "";
                
                return (
                  <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
                    {/* Horizontal Card Layout */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center gap-4 sm:gap-5 max-w-[560px] mx-auto">
                      {/* Avatar */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                        <img
                          src={avatar}
                          alt={item.author || "Student"}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col items-start text-left space-y-2 w-full">
                        {/* Stars */}
                        <div className="flex gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} weight="fill" />
                          ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium">
                          "{quoteText}"
                        </blockquote>

                        {/* Author */}
                        <p className="text-[10px] sm:text-[11px] font-black text-gray-800 tracking-wide uppercase">
                          {item.author || item.author_name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-[#F8861D] hover:border-[#F8861D] transition-all duration-300 flex items-center justify-center cursor-pointer z-30"
            aria-label="Previous testimonial"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-[#F8861D] hover:border-[#F8861D] transition-all duration-300 flex items-center justify-center cursor-pointer z-30"
            aria-label="Next testimonial"
          >
            <CaretRight className="w-4 h-4" weight="bold" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 mt-5">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                index === selectedIndex ? "w-6 bg-[#F8861D]" : "w-1.5 bg-gray-200"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
