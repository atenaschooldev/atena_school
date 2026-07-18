"use client";

import { useTranslations, useLocale } from "next-intl";
import { CaretLeft, CaretRight, Star, X } from "@phosphor-icons/react";
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
  quote?: string;
  content_it?: string;
  author_name?: string;
  [key: string]: any;
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40, slidesToScroll: 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState<Testimonial | null>(null);

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

  // Disable body scroll when modal is open, compensating for scrollbar width to prevent layout shift
  useEffect(() => {
    if (activeTestimonial) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, [activeTestimonial]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      }, 4000); // 6.5 seconds to give plenty of time to read
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
    };

    // Pause autoplay during modal overlay
    if (!activeTestimonial) {
      startAutoplay();
    }

    // Pause autoplay during drag interactions
    emblaApi.on("pointerDown", stopAutoplay);
    emblaApi.on("pointerUp", () => {
      if (!activeTestimonial) startAutoplay();
    });

    return () => {
      clearInterval(intervalId);
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", stopAutoplay);
    };
  }, [emblaApi, onSelect, activeTestimonial]);

  return (
    <section className="py-6 sm:py-8 px-4 bg-white relative overflow-hidden">

      {/* Centered Header */}
      <div className="max-w-2xl mx-auto relative z-20 text-center mb-8 px-4 space-y-1" data-gsap="fade-up">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F8861D]">
          COSA DICONO DI NOI
        </span>
        <h2 className="text-lg sm:text-xl font-serif font-black text-[#043569]">
          {t("title")}
        </h2>
      </div>

      {/* Constrained Carousel container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 overflow-hidden" data-gsap="fade-up" data-gsap-delay="100">
        {/* Soft edge fade overlays */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 sm:w-20 md:w-28 z-30 bg-gradient-to-r from-white via-white/35 to-white/0" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 sm:w-20 md:w-28 z-30 bg-gradient-to-l from-white via-white/35 to-white/0" />

        <div className="relative group w-full max-w-none px-0">
          {/* Carousel Viewport */}
          <div
            className="overflow-hidden py-4 -my-4 px-4 md:px-12 w-full"
            ref={emblaRef}
          >
            <div className="flex -ml-4 items-stretch">
              {testimonials.map((item, index) => {
                const avatar = item.avatar_url || FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
                const quoteText = item[`quote_${locale}`] || item.quote || item.content_it || "";

                return (
                  <div key={index} className="flex-[0_0_88%] md:flex-[0_0_46%] lg:flex-[0_0_31%] xl:flex-[0_0_24%] min-w-0 pl-4 relative">
                    <div
                      className="relative w-full"
                      onClick={() => {
                        setActiveTestimonial({
                          ...item,
                          avatar_url: avatar
                        });
                      }}
                    >
                      {/* Non-expanded Card */}
                      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between h-[148px] w-full relative transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer select-none">
                        
                        {/* Top section: Avatar + Quote content */}
                        <div className="flex flex-row items-start gap-4 w-full min-w-0">
                          {/* Avatar */}
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-gray-200 shrink-0 mt-0.5">
                            <img
                              src={avatar}
                              alt={item.author || "Student"}
                              className="object-cover w-full h-full"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex flex-col items-start text-left w-full min-w-0 py-0.5">
                            {/* Stars */}
                            <div className="flex gap-0.5 text-amber-500 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} weight="fill" />
                              ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium line-clamp-3 pr-2 w-full">
                              "{quoteText}"
                            </blockquote>
                          </div>
                        </div>

                        {/* Bottom Full-width Footer (shifted to the left!) */}
                        <div className="flex items-center justify-between w-full pt-1.5 border-t border-gray-100 gap-2 mt-2">
                          <p className="text-[9px] font-black text-gray-800 tracking-wide uppercase truncate min-w-0 flex-1 text-left">
                            {item.author || item.author_name}
                          </p>
                          <span className="text-[9px] font-black text-[#F8861D] tracking-wide uppercase shrink-0 hover:underline">
                            Leggi tutto →
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls: Indicators Only */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${index === selectedIndex ? "w-6 bg-[#F8861D]" : "w-1.5 bg-gray-200"
                }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {activeTestimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveTestimonial(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-gray-100 text-gray-900 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveTestimonial(null)}
              className="absolute right-4 top-4 p-2 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>

            {/* Testimonial Author & Avatar Header */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img
                  src={activeTestimonial.avatar_url}
                  alt={activeTestimonial.author || "Student"}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-800 tracking-wide uppercase">
                  {activeTestimonial.author || activeTestimonial.author_name}
                </p>
                {/* Stars */}
                <div className="flex gap-0.5 text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} weight="fill" />
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Body */}
            <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed font-semibold text-left max-h-[300px] overflow-y-auto pr-1">
              "{activeTestimonial[`quote_${locale}`] || activeTestimonial.quote || activeTestimonial.content_it || ""}"
            </blockquote>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
