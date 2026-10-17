"use client";

import { useState } from "react";
import Image from "next/image";
import { CaretRight, Clock, User, Calendar, ArrowsClockwise } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { CourseBillingType } from "@atena/api-types";
import { formatCourseScheduleText, formatCourseDurationText } from "@/lib/utils/bookingScheduler";

interface CourseCardProps {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  category?: string;
  price?: string;
  billing_type?: number | null;
  subscription_price?: number | string | null;
  type?: "course" | "shop" | string;
  teacher_name?: string;
  onCtaClick?: () => void;
  priority?: boolean;
  lessons_per_week?: number | null;
  lesson_duration_minutes?: number | null;
  total_hours?: number | null;
  total_lessons?: number | null;
  course_format?: string | number | null;
  schedule_days?: number[] | string[] | null;
  start_time?: string | null;
  end_time?: string | null;
}

const CourseCard = ({ 
  id, 
  slug,
  title, 
  description, 
  image, 
  category, 
  price, 
  billing_type,
  subscription_price,
  type = "course", 
  teacher_name,
  onCtaClick,
  priority = false,
  lessons_per_week,
  lesson_duration_minutes,
  total_hours,
  total_lessons,
  course_format,
  schedule_days,
  start_time,
  end_time,
}: CourseCardProps) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const courseSlug = slug || id;

  const billingTypeNum = billing_type !== undefined && billing_type !== null ? Number(billing_type) : CourseBillingType.ONE_TIME_ONLY;
  const subPriceNum = subscription_price !== undefined && subscription_price !== null
    ? Number(subscription_price)
    : (price ? parseFloat(price.replace(/[^0-9.]/g, "")) : 73.2);

  const normalizedDays = Array.isArray(schedule_days)
    ? schedule_days.map((d) => (typeof d === "number" ? d : parseInt(String(d), 10))).filter((n) => !isNaN(n))
    : null;
  const formattedSchedule = formatCourseScheduleText(normalizedDays, start_time, end_time);
  const showSchedule = formattedSchedule && formattedSchedule !== "Da concordare";
  const formattedDuration = formatCourseDurationText(lesson_duration_minutes, total_hours, total_lessons);

  const getLessonsPerWeekText = (titleStr: string, scheduleStr?: string): string | null => {
    const lowerTitle = String(titleStr || "").toLowerCase();
    const lowerSchedule = String(scheduleStr || "").toLowerCase();
    
    if (lowerTitle.includes("c2") || lowerSchedule.includes("c2")) {
      return "3 lezioni a settimana";
    }
    if (lowerTitle.includes("c1") || lowerSchedule.includes("c1")) {
      return "2 lezioni a settimana";
    }
    
    // Count weekdays in fixed schedule
    let count = 0;
    if (lowerSchedule.includes("luned")) count++;
    if (lowerSchedule.includes("marted")) count++;
    if (lowerSchedule.includes("mercoled")) count++;
    if (lowerSchedule.includes("gioved")) count++;
    if (lowerSchedule.includes("venerd")) count++;
    if (lowerSchedule.includes("sabat")) count++;
    if (lowerSchedule.includes("domenic")) count++;
    
    if (count > 0) {
      return `${count} ${count === 1 ? "lezione" : "lezioni"} a settimana`;
    }
    
    return null;
  };

  const lessonsPerWeek = (typeof lessons_per_week === "number" && lessons_per_week > 0)
    ? `${lessons_per_week} ${lessons_per_week === 1 ? "lezione" : "lezioni"} a settimana`
    : getLessonsPerWeekText(title, formattedSchedule);

  const formatCategoryName = (cat?: string | number | null): string => {
    if (!cat) return "";
    const lower = String(cat).toLowerCase();
    if (lower === "languages" || lower === "language" || lower === "1") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero" || lower === "2") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass" || lower === "3") return "Certificazioni EIPASS";
    return String(cat);
  };

  const cardContent = (
    <div 
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
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 shadow-sm select-none">
            {formatCategoryName(category)}
          </div>
        )}

        {/* Subscription Format Badge */}
        {billingTypeNum === CourseBillingType.BOTH && (
          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1 select-none">
            <ArrowsClockwise className="w-3 h-3" weight="bold" />
            Abbonamento o Saldo
          </div>
        )}
        {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY && (
          <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1 select-none">
            <ArrowsClockwise className="w-3 h-3" weight="bold" />
            Abbonamento Mensile
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
            priority={priority}
            className={`
              object-cover transition-transform duration-700 ease-out
              ${isButtonHovered ? "scale-100" : "group-hover:scale-105"}
            `}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-8 text-center transition-all duration-500">
            <span className="text-primary/30 font-black uppercase tracking-widest text-sm leading-tight select-none">
              {title}
            </span>
          </div>
        )}
      </div>
      
      {/* Content wrapper */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow relative z-20">
        <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Metadata badges (duration, schedule, teacher, frequency) */}
        {(formattedDuration || showSchedule || teacher_name || lessonsPerWeek) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4 font-bold select-none">
            {formattedDuration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>{formattedDuration}</span>
              </div>
            )}
            {showSchedule && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>{formattedSchedule}</span>
              </div>
            )}
            {lessonsPerWeek && (
              <div className="flex items-center gap-1.5 text-primary">
                <Calendar className="w-3.5 h-3.5 text-secondary" />
                <span>{lessonsPerWeek}</span>
              </div>
            )}
            {teacher_name && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-secondary" />
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
          {billingTypeNum === CourseBillingType.BOTH ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 select-none block">Prezzo</span>
                <span className="text-[10px] font-bold text-slate-400">oppure in abbonamento</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-secondary block leading-tight">
                  {price || "---"}
                </span>
                <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-1.5 py-0.5 rounded inline-block mt-0.5">
                  o da {subPriceNum.toFixed(2)}€/mese
                </span>
              </div>
            </div>
          ) : billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 select-none">Abbonamento</span>
              <span className="text-lg font-black text-secondary">
                {subPriceNum.toFixed(2)}€<span className="text-xs font-semibold text-slate-500">/mese</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 select-none">Prezzo</span>
              <span className="text-lg font-black text-secondary">
                {price || "---"}
              </span>
            </div>
          )}

          {/* Buttons Row */}
          <div>
            {courseSlug ? (
              <span
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="w-full py-3 bg-secondary text-white hover:bg-primary rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all duration-300 shadow-md shadow-secondary/15 hover:shadow-none flex items-center justify-center gap-1 active:scale-95"
              >
                {type === "shop" ? "Acquista" : "Prenota"}
                <CaretRight className="w-3.5 h-3.5" weight="bold" />
              </span>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-secondary/50 text-white rounded-xl text-xs font-black uppercase tracking-widest text-center cursor-not-allowed flex items-center justify-center gap-1"
              >
                {type === "shop" ? "Acquista" : "Prenota"}
                <CaretRight className="w-3.5 h-3.5" weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (courseSlug) {
    return (
      <Link href={`/corsi/${courseSlug}`} className="block h-full no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default CourseCard;
