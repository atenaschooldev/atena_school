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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
    <section className="py-6 sm:py-8 px-4 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-12 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-2xl mx-auto relative z-20">
        {/* Section Header */}
        <div className="text-center mb-4 px-4 space-y-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F8861D]">
            COSA DICONO DI NOI
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-black text-[#043569]">
            {t("title")}
          </h2>
        </div>

        <div className="relative group w-full">
          {/* Carousel Viewport */}
          <div 
            className="overflow-hidden" 
            ref={emblaRef}
          >
            <div className="flex items-stretch">
              {testimonials.map((item, index) => {
                const avatar = item.avatar_url || FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
                const quoteText = item[`quote_${locale}`] || item.quote || item.content_it || "";
                const isLong = quoteText.length > 100;
                
                return (
                  <div key={index} className="flex-[0_0_100%] min-w-0 px-2 relative">
                    <div
                      className="relative max-w-[560px] mx-auto"
                      onClick={() => isLong && setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      {/* Non-expanded Card */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-row items-start gap-4 h-[148px] w-full relative transition-all duration-300 hover:shadow-md cursor-pointer select-none">
                        {/* Avatar */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-gray-100 shrink-0 shadow-sm mt-0.5">
                          <img
                            src={avatar}
                            alt={item.author || "Student"}
                            className="object-cover w-full h-full"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col items-start text-left w-full min-w-0 h-full justify-between py-0.5">
                          <div className="space-y-1 w-full">
                            {/* Stars */}
                            <div className="flex gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} weight="fill" />
                              ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium line-clamp-3 pr-2 w-full">
                              "{quoteText}"
                            </blockquote>
                          </div>

                          {/* Author & Read More Indicator */}
                          <div className="flex items-center justify-between w-full pt-1.5 border-t border-gray-100">
                            <p className="text-[9px] font-black text-gray-800 tracking-wide uppercase truncate max-w-[60%]">
                              {item.author || item.author_name}
                            </p>
                            {isLong && (
                              <span className="text-[9px] font-black text-[#F8861D] tracking-wide uppercase shrink-0 hover:underline">
                                Leggi tutto →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Overlay */}
                      {isLong && expandedIndex === index && (
                        <div 
                          className="absolute top-0 left-0 right-0 z-50 bg-white border border-[#F8861D]/20 rounded-3xl p-4 shadow-xl flex flex-row items-start gap-4 h-auto w-full transition-all duration-300 cursor-pointer select-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedIndex(null);
                          }}
                        >
                          {/* Avatar */}
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-gray-100 shrink-0 shadow-sm mt-0.5">
                            <img
                              src={avatar}
                              alt={item.author || "Student"}
                              className="object-cover w-full h-full"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex flex-col items-start text-left w-full min-w-0">
                            {/* Stars */}
                            <div className="flex gap-0.5 text-amber-500 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} weight="fill" />
                              ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium max-h-[180px] overflow-y-auto pr-2 w-full mb-2">
                              "{quoteText}"
                            </blockquote>

                            {/* Author & Close Hint */}
                            <div className="flex items-center justify-between w-full pt-1.5 border-t border-gray-100">
                              <p className="text-[9px] font-black text-gray-800 tracking-wide uppercase truncate max-w-[60%]">
                                {item.author || item.author_name}
                              </p>
                              <span className="text-[9px] font-black text-gray-400 tracking-wide uppercase shrink-0">
                                Clicca per chiudere ×
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls: Navigation Arrows + Indicators */}
        <div className="flex items-center justify-center gap-5 mt-4">
          <button
            onClick={scrollPrev}
            className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-[#F8861D] hover:border-[#F8861D] transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Previous testimonial"
          >
            <CaretLeft className="w-3.5 h-3.5" weight="bold" />
          </button>
          
          <div className="flex gap-1">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1 transition-all duration-500 rounded-full cursor-pointer ${
                  index === selectedIndex ? "w-4 bg-[#F8861D]" : "w-1 bg-gray-200"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-[#F8861D] hover:border-[#F8861D] transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Next testimonial"
          >
            <CaretRight className="w-3.5 h-3.5" weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
