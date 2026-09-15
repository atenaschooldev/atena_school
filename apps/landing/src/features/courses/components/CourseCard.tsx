"use client";

import { useState } from "react";
import Image from "next/image";
import { CaretRight, Clock, User, Calendar } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { formatCourseScheduleText, formatCourseDurationText } from "@/lib/utils/bookingScheduler";

interface CourseCardProps {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  image?: string;
  category?: string;
  price?: string;
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

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = String(cat).toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
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
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-[#043569] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 shadow-sm select-none">
            {formatCategoryName(category)}
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

        {/* Metadata badges (duration, schedule, teacher, frequency) */}
        {(formattedDuration || showSchedule || teacher_name || lessonsPerWeek) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4 font-bold select-none">
            {formattedDuration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F8861D]" />
                <span>{formattedDuration}</span>
              </div>
            )}
            {showSchedule && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F8861D]" />
                <span>{formattedSchedule}</span>
              </div>
            )}
            {lessonsPerWeek && (
              <div className="flex items-center gap-1.5 text-[#043569]">
                <Calendar className="w-3.5 h-3.5 text-[#F8861D]" />
                <span>{lessonsPerWeek}</span>
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
          <div>
            {courseSlug ? (
              <span
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="w-full py-3 bg-[#F8861D] text-white hover:bg-[#043569] rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all duration-300 shadow-md shadow-[#F8861D]/15 hover:shadow-none flex items-center justify-center gap-1 active:scale-95"
              >
                {type === "shop" ? "Acquista" : "Prenota"}
                <CaretRight className="w-3.5 h-3.5" weight="bold" />
              </span>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-[#F8861D]/50 text-white rounded-xl text-xs font-black uppercase tracking-widest text-center cursor-not-allowed flex items-center justify-center gap-1"
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
