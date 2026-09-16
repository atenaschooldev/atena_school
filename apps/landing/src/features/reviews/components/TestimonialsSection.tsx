"use client";

import { useTranslations } from "next-intl";
import { Star, X, CheckCircle, ArrowUpRight } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { Testimonial } from "@/features/home/services/homeService";

interface TestimonialsSectionProps {
  data?: Testimonial[];
}

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7";

const FALLBACK_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
];

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface RawTranslationTestimonial {
  quote_it?: string;
  quote?: string;
  author?: string;
  role_it?: string;
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  const t = useTranslations("testimonials");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40, slidesToScroll: 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState<Testimonial | null>(null);

  // Fallback to translations if no data provided
  const rawList = (t.raw("list") || []) as RawTranslationTestimonial[];
  const testimonials: Testimonial[] = data && data.length > 0 ? data : rawList.map((item, i: number) => ({
    id: String(i),
    quote: item.quote_it || item.quote || "",
    author: item.author || "",
    role: item.role_it || "Studente verificato",
    avatarUrl: null,
  }));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Disable body scroll when modal is open
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
      }, 5000);
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
    };

    if (!activeTestimonial) {
      startAutoplay();
    }

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
    <section className="py-14 sm:py-20 px-4 bg-slate-50/70 relative overflow-hidden" id="recensioni">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none -z-0" />

      {/* Header with Google Brand & Rating Pill */}
      <div className="max-w-3xl mx-auto relative z-20 text-center mb-10 px-4 space-y-3" data-gsap="fade-up">
        
        {/* Top Tag & Google Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs">
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-black text-slate-800">Recensioni Google</span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center text-amber-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} weight="fill" />
            ))}
          </div>
          <span className="text-[11px] font-black text-[#043569]">5.0</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#043569] leading-tight tracking-tight">
          Cosa dicono i nostri studenti
        </h2>

        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Esperienze reali di studenti e genitori che hanno frequentato i nostri corsi a Cittanova e online.
        </p>

        {/* Link to Google Maps Place */}
        <div className="pt-1">
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#043569] hover:text-[#F8861D] transition-colors py-1 px-3 rounded-lg hover:bg-white/80"
          >
            <span>Visualizza su Google Maps</span>
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative z-20 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 overflow-hidden" data-gsap="fade-up" data-gsap-delay="100">
        
        {/* Edge Fade Overlays */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 sm:w-16 md:w-24 z-30 bg-gradient-to-r from-slate-50 via-slate-50/50 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 sm:w-16 md:w-24 z-30 bg-gradient-to-l from-slate-50 via-slate-50/50 to-transparent" />

        <div className="relative w-full">
          {/* Carousel Viewport */}
          <div className="overflow-hidden py-4 -my-4 px-2 md:px-6 w-full" ref={emblaRef}>
            <div className="flex -ml-4 items-stretch">
              {testimonials.map((item, index) => {
                const avatar = item.avatarUrl || FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];

                return (
                  <div
                    key={item.id || index}
                    className="flex-[0_0_90%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_24%] min-w-0 pl-4 relative"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-haspopup="dialog"
                      aria-label={`Leggi recensione di ${item.author}`}
                      className="h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#043569] rounded-3xl"
                      onClick={() => setActiveTestimonial({ ...item, avatarUrl: avatar })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveTestimonial({ ...item, avatarUrl: avatar });
                        }
                      }}
                    >
                      {/* Review Card */}
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px] w-full relative cursor-pointer select-none text-left group">
                        
                        {/* Top: User info + Google Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                              <img
                                src={avatar}
                                alt={item.author}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">
                                {item.author}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                                <CheckCircle size={12} weight="fill" />
                                <span>Verificato</span>
                              </div>
                            </div>
                          </div>

                          {/* Google G Icon */}
                          <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                            <GoogleIcon className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Stars & Quote */}
                        <div className="space-y-1.5 my-auto pt-2">
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} weight="fill" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                            "{item.quote}"
                          </p>
                        </div>

                        {/* Bottom Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span>Google Maps</span>
                          <span className="text-[#F8861D] group-hover:translate-x-0.5 transition-transform font-extrabold">
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

        {/* Indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                index === selectedIndex ? "w-6 bg-[#F8861D]" : "w-1.5 bg-slate-200"
              }`}
              aria-label={`Vai alla recensione ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Modal Dialog for Full Review */}
      {activeTestimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveTestimonial(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-slate-100 text-slate-900 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveTestimonial(null)}
              className="absolute right-4 top-4 p-2 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>

            {/* Testimonial Author & Google Header */}
            <div className="flex items-center justify-between gap-4 pr-8">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={activeTestimonial.avatarUrl ?? undefined}
                    alt={activeTestimonial.author}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">
                    {activeTestimonial.author}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle size={13} weight="fill" />
                    <span>Recensione verificata su Google</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} weight="fill" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                <GoogleIcon className="w-4 h-4" />
              </div>
            </div>

            {/* Quote Body */}
            <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium text-left max-h-[300px] overflow-y-auto pr-2">
              "{activeTestimonial.quote}"
            </blockquote>

            {/* Footer with link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#043569] hover:text-[#F8861D] transition-colors"
              >
                <span>Vedi scheda su Google Maps</span>
                <ArrowUpRight size={14} weight="bold" />
              </a>
              <button
                onClick={() => setActiveTestimonial(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
