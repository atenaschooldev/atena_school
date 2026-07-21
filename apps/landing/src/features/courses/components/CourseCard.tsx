"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CaretRight, Clock, User, CreditCard, X } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CourseCardProps {
  id?: string;
  title: string;
  description: string;
  image?: any;
  category?: string;
  price?: string;
  type?: "course" | "shop";
  duration?: string;
  teacher_name?: string;
  onCtaClick?: () => void;
}

const CourseCard = ({ 
  id, 
  title, 
  description, 
  image, 
  category, 
  price, 
  type = "course", 
  duration,
  teacher_name,
  onCtaClick 
}: CourseCardProps) => {
  const t = useTranslations("coursesPage");
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    setIsOpen(true);
  };

  const cardContent = (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(true);
        }
      }}
      className={`
        group bg-white rounded-3xl overflow-hidden border border-border/40 flex flex-col h-full active:scale-[0.99] relative text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-500
        ${isButtonHovered 
          ? "shadow-[0_4px_20px_rgba(0,0,0,0.02)] translate-y-0" 
          : "shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(4,53,105,0.06)] hover:-translate-y-1.5"
        }
      `}
    >
      {/* Image container */}
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-[#043569] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 shadow-sm select-none">
            {category}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`
              object-cover transition-transform duration-700 ease-out
              ${isButtonHovered ? "scale-100" : "group-hover:scale-105"}
            `}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#043569]/5 to-[#F8861D]/10 flex items-center justify-center p-8 text-center transition-all duration-500">
            <span className="text-[#043569]/30 font-black uppercase tracking-widest text-sm leading-tight select-none">
              {title}
            </span>
          </div>
        )}
      </div>
      
      {/* Content wrapper */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-20">
        <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 leading-tight tracking-tight group-hover:text-[#043569] transition-colors duration-300">
          {title}
        </h3>

        {/* Metadata badges (duration, teacher) */}
        {(duration || teacher_name) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4 font-bold select-none">
            {duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F8861D]" />
                <span>{duration}</span>
              </div>
            )}
            {teacher_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#F8861D]" />
                <span>{teacher_name}</span>
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow font-medium opacity-90 line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>
        
        {/* Footer info & Buttons */}
        <div className="pt-5 border-t border-border/40 mt-auto flex flex-col gap-4">
          {/* Price Row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 select-none">Prezzo</span>
            <span className="text-lg font-black text-[#F8861D]">
              {price || "---"}
            </span>
          </div>

          {/* Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="w-full py-3 bg-[#043569]/5 hover:bg-[#043569] text-[#043569] hover:text-white border border-[#043569]/10 hover:border-[#043569] rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all duration-300 cursor-pointer active:scale-95 shadow-sm hover:shadow-md hover:shadow-[#043569]/10"
            >
              {t("cta")}
            </button>
            {id && (
              <Link
                href={`/book/${type}/${id}`}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="w-full py-3 bg-[#F8861D] text-white hover:bg-[#043569] rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all duration-300 shadow-md shadow-[#F8861D]/15 hover:shadow-none flex items-center justify-center gap-1 active:scale-95"
              >
                {type === "shop" ? "Acquista" : "Prenota"}
                <CaretRight className="w-3.5 h-3.5" weight="bold" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {cardContent}

      {/* Details Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[92vw] sm:w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-8 border border-border/50 shadow-2xl overflow-y-auto max-h-[90vh] focus-visible:outline-none [&>button[class*='absolute']]:hidden">
          {/* Custom Floating Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 sm:top-12 sm:right-12 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white text-foreground hover:text-[#043569] transition-all duration-300 flex items-center justify-center border border-black/10 shadow-md backdrop-blur-md cursor-pointer active:scale-90"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
          </button>
          {/* Large image inside dialog */}
          <div className="relative h-64 sm:h-96 w-full overflow-hidden rounded-2xl bg-muted mb-5">
            {image ? (
              <Image 
                src={image} 
                alt={title} 
                fill 
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#043569]/5 to-[#F8861D]/10 flex items-center justify-center p-8 text-center">
                <span className="text-[#043569]/30 font-black uppercase tracking-widest text-sm leading-tight select-none">
                  {title}
                </span>
              </div>
            )}
            {category && (
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md text-[#043569] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
                {category}
              </div>
            )}
          </div>

          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl sm:text-3xl font-black text-[#043569] tracking-tight leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Details Grid (Duration, Teacher, Price) */}
          <div className="flex flex-wrap gap-x-6 gap-y-4 my-5 py-4 border-y border-border/40 text-sm select-none">
            {duration && (
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-[#F8861D]/10 flex items-center justify-center shrink-0 text-[#F8861D]">
                  <Clock className="w-4.5 h-4.5" weight="bold" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 leading-none mb-1">Durata</p>
                  <p className="font-bold text-foreground text-xs sm:text-sm leading-none">{duration}</p>
                </div>
              </div>
            )}
            {teacher_name && (
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-[#F8861D]/10 flex items-center justify-center shrink-0 text-[#F8861D]">
                  <User className="w-4.5 h-4.5" weight="bold" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 leading-none mb-1">Insegnante</p>
                  <p className="font-bold text-foreground text-xs sm:text-sm leading-none">{teacher_name}</p>
                </div>
              </div>
            )}
            {price && (
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="w-9 h-9 rounded-xl bg-[#F8861D]/10 flex items-center justify-center shrink-0 text-[#F8861D]">
                  <CreditCard className="w-4.5 h-4.5" weight="bold" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 leading-none mb-1">Prezzo</p>
                  <p className="font-bold text-foreground text-xs sm:text-sm leading-none">{price}</p>
                </div>
              </div>
            )}
          </div>

          {/* Detailed description */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Informazioni sul corso</h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Action button: Redirects to booking/checkout process */}
          <div className="mt-8 flex flex-col gap-3">
            {id && (
              <Link 
                href={`/book/${type}/${id}`}
                className="w-full py-4 bg-[#F8861D] text-white border-2 border-transparent hover:bg-white hover:text-[#F8861D] hover:border-[#F8861D] rounded-2xl font-black uppercase tracking-widest text-sm text-center transition-all shadow-xl shadow-[#F8861D]/20 hover:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {type === "shop" ? "Acquista Ora" : "Prenota Ora"}
                <CaretRight className="w-4 h-4" weight="bold" />
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseCard;
