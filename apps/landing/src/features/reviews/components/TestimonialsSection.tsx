"use client";

import { useTranslations, useLocale } from "next-intl";
import { Quotes, CaretLeft, CaretRight } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface Testimonial {
  id?: string;
  quote_it?: string;
  quote_en?: string;
  author?: string;
  role_it?: string;
  role_en?: string;
}

interface TestimonialsSectionProps {
  data?: any[];
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
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
    <section className="py-16 px-4 bg-muted relative overflow-hidden">
      {/* Top wave transition from Teachers (background/white) to Testimonials (bg-muted) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[40px] fill-background">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,1,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-12 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-20">
        <div className="text-center mb-10 px-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mb-3">
            {t("title")}
          </h2>
          <div className="h-0.5 w-12 bg-primary mx-auto" />
        </div>

        <div className="relative group max-w-4xl mx-auto">
          {/* Carousel Viewport */}
          <div 
            className="overflow-hidden" 
            ref={emblaRef}
          >
            <div className="flex items-start">
              {testimonials.map((item, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-4 md:px-10">
                  <div className="flex flex-col items-center text-center">
                    <Quotes className="w-8 h-8 text-primary/20 mb-6" />
                    <blockquote 
                      className="text-lg md:text-xl lg:text-2xl italic text-foreground/90 leading-snug mb-8 font-medium"
                    >
                      "{item[`quote_${locale}`] || item.quote}"
                    </blockquote>
                    <div className="flex flex-col items-center">
                      <div className="h-px w-6 bg-primary/30 mb-3" />
                      <p className="text-base font-bold text-primary tracking-wide uppercase">
                        {item.author}
                      </p>
                      {(item[`role_${locale}`] || item.role) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item[`role_${locale}`] || item.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-8 p-2.5 rounded-full bg-background border border-border shadow-sm text-foreground/40 hover:text-primary hover:border-primary transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Previous testimonial"
          >
            <CaretLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-8 p-2.5 rounded-full bg-background border border-border shadow-sm text-foreground/40 hover:text-primary hover:border-primary transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:flex"
            aria-label="Next testimonial"
          >
            <CaretRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1 transition-all duration-500 rounded-full ${
                  index === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Google Map */}
        <div className="max-w-6xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-card">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3121.5!2d16.0781!3d38.3561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x131153d3a3e6b8b7%3A0x0!2sViale+Giacomo+Matteotti+11%2C+89022+Cittanova+RC!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit&q=Viale+Giacomo+Matteotti+11,+89022+Cittanova+RC"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Atena School - Viale Giacomo Matteotti 11, Cittanova"
            className="grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
