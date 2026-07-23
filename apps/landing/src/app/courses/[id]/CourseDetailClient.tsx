"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  CaretLeft,
  Clock,
  Calendar as CalendarIcon,
  User,
  Users,
  Certificate,
  CheckCircle,
  ShieldCheck,
  Headset,
  BookOpen,
  Trophy,
  Info,
  CalendarCheck,
  ArrowRight,
  GraduationCap,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { Calendar } from "@/components/ui/calendar";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { calculateLessonDates, formatCourseScheduleText } from "@/lib/utils/bookingScheduler";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";

interface CourseDetailClientProps {
  id: string;
  initialCourse: any;
  initialUser: any;
}

export default function CourseDetailClient({
  id,
  initialCourse,
  initialUser,
}: CourseDetailClientProps) {
  const dateLocale = it;

  const {
    item: course,
    isFixedSchedule,
    isFlexibleSchedule,
    allowedDays,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    title,
    courseDuration,
    handleContinue,
  } = useBooking("course", id, initialCourse, initialUser);

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };

  const formattedScheduleText = formatCourseScheduleText(
    course?.schedule_days,
    course?.start_time,
    course?.end_time
  );

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
    return cat;
  };

  const getCourseFormatDetails = (
    formatStr?: string | null,
    titleStr?: string,
    categoryStr?: string
  ): { label: string; icon: any } => {
    const lowerFormat = (formatStr || "").toLowerCase();
    const lowerTitle = (titleStr || "").toLowerCase();
    const lowerCat = (categoryStr || "").toLowerCase();

    if (
      lowerCat.includes("certipass") ||
      lowerCat.includes("eipass") ||
      lowerTitle.includes("eipass") ||
      lowerFormat.includes("certif")
    ) {
      return { label: "Certificazione", icon: Certificate };
    }

    if (
      lowerTitle.includes("individuale") ||
      lowerTitle.includes("privat") ||
      lowerCat.includes("academic") ||
      lowerCat.includes("recupero") ||
      lowerFormat.includes("indiv") ||
      lowerFormat.includes("privat")
    ) {
      return { label: "Corso Individuale", icon: User };
    }

    return { label: "Corso di Gruppo", icon: Users };
  };

  const courseFormat = getCourseFormatDetails(
    course?.course_format,
    title,
    course?.category
  );
  const FormatIcon = courseFormat.icon;

  const getLessonsPerWeekText = (titleStr: string, scheduleStr?: string): string | null => {
    const lowerTitle = titleStr.toLowerCase();
    const lowerSchedule = (scheduleStr || "").toLowerCase();
    
    if (lowerTitle.includes("c2") || lowerSchedule.includes("c2")) {
      return "3 lezioni a settimana";
    }
    if (lowerTitle.includes("c1") || lowerSchedule.includes("c1")) {
      return "2 lezioni a settimana";
    }
    
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

  const lessonsPerWeek = (typeof course?.lessons_per_week === "number" && course.lessons_per_week > 0)
    ? `${course.lessons_per_week} ${course.lessons_per_week === 1 ? "lezione" : "lezioni"} a settimana`
    : getLessonsPerWeekText(title, formattedScheduleText);

  const endDate = selectedDate ? addMonths(selectedDate, 1) : null;
  const previewLessons =
    selectedDate && isFixedSchedule
      ? calculateLessonDates(
          format(selectedDate, "yyyy-MM-dd"),
          course?.start_time || "16:00",
          course?.category || "",
          course?.schedule_days,
          course?.lesson_duration_minutes || 60,
          course?.start_time,
          course?.end_time,
          course?.schedule_type
        )
      : [];

  const canContinue = isFlexibleSchedule || (!!selectedDate && !!selectedTime);
  const priceDisplay = course?.price ? `${Number(course.price).toFixed(2)}€` : null;

  return (
    <main className="min-h-screen bg-slate-50/50 pt-20 pb-24 relative">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#043569]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F8861D]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#043569] transition-colors group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Torna ai corsi
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT MAIN CONTAINER (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-10">
            
            {/* Header Title & Badges */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {course?.category && (
                  <span className="bg-[#043569]/10 text-[#043569] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                    {formatCategoryName(course.category)}
                  </span>
                )}
                <span className="bg-[#F8861D]/10 text-[#F8861D] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <FormatIcon className="w-3.5 h-3.5" weight="bold" />
                  {courseFormat.label}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#043569] tracking-tight leading-tight">
                {title}
              </h1>
            </div>

            {/* Main Cover Image */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
              {course?.photo_url ? (
                <Image
                  src={course.photo_url}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#043569]/10 to-[#F8861D]/15 flex items-center justify-center p-8 text-center">
                  <GraduationCap className="w-20 h-20 text-[#043569]/30" />
                </div>
              )}
            </div>

            {/* Course Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 border-y border-slate-100">
              {courseDuration && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8861D]/10 text-[#F8861D] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Durata</p>
                    <p className="text-sm font-bold text-slate-800">{courseDuration}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8861D]/10 text-[#F8861D] flex items-center justify-center shrink-0">
                  <FormatIcon className="w-5 h-5" weight="bold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Formato</p>
                  <p className="text-sm font-bold text-slate-800">{courseFormat.label}</p>
                </div>
              </div>

              {lessonsPerWeek && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#043569]/10 text-[#043569] flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Frequenza</p>
                    <p className="text-sm font-bold text-slate-800">{lessonsPerWeek}</p>
                  </div>
                </div>
              )}

              {formattedScheduleText && formattedScheduleText !== "Da concordare" && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#043569]/10 text-[#043569] flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orario</p>
                    <p className="text-sm font-bold text-slate-800">{formattedScheduleText}</p>
                  </div>
                </div>
              )}

              {course?.teacher_name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8861D]/10 text-[#F8861D] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Docente</p>
                    <p className="text-sm font-bold text-slate-800">{course.teacher_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            {(course?.description_it || course?.description) && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-[#043569] uppercase tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#F8861D]" weight="bold" />
                  Informazioni sul corso
                </h2>
                <p className="text-slate-600 leading-relaxed font-medium text-base whitespace-pre-line">
                  {course.description_it || course.description}
                </p>
              </div>
            )}

            {/* Course Benefits & Features */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-black text-[#043569] uppercase tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F8861D]" weight="bold" />
                Cosa è incluso nel corso
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Docenti qualificati</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Lezioni tenute da esperti e madrelingua</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Materiale didattico</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Dispense, esercizi e risorse digitali</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Attestato finale</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Certificato di frequenza ufficiale Atena</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sede & Online</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Frequenza flessibile per ogni esigenza</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT STICKY SIDEBAR (5 cols on lg, 4 cols on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
              
              {/* Clean Price Header */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Prezzo Corso</span>
                    <p className="text-3xl sm:text-4xl font-black text-[#F8861D]">
                      {priceDisplay || "---"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                    Posti disponibili
                  </span>
                </div>

                {/* Annual Registration Fee Notice */}
                <div className="flex items-start gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-normal">
                  <Info className="w-3.5 h-3.5 text-[#043569] shrink-0 mt-0.5" weight="bold" />
                  <span>
                    + <strong>{ANNUAL_REGISTRATION_FEE_EUR}€</strong> di quota di iscrizione annuale obbligatoria per studente (valida 12 mesi, selezionabile al checkout).
                  </span>
                </div>
              </div>

              {/* Date & Schedule Selection (Flat, No nested box clutter) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {isFlexibleSchedule ? "Orario Flessibile" : "Seleziona Data di Inizio"}
                  </h3>
                  {isFixedSchedule && (
                    <span className="text-[10px] font-bold text-[#043569] bg-[#043569]/5 px-2 py-0.5 rounded-md">
                      Orario fisso
                    </span>
                  )}
                </div>

                {isFlexibleSchedule ? (
                  <div className="py-2 text-xs text-slate-500 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold text-[#043569] mb-1">
                      <CalendarCheck className="w-4 h-4 text-[#F8861D]" />
                      Date concordabili
                    </div>
                    Questo corso prevede un orario personalizzato. Dopo l'iscrizione, la nostra segreteria ti contatterà per definire insieme i giorni e gli orari.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Calendar: Formatted borderless, clean flat inside the sidebar */}
                    <div className="flex justify-center py-2">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            setSelectedDate(date);
                            setSelectedTime(formattedScheduleText || "16:00");
                          }
                        }}
                        disabled={(date: Date) => {
                          const day = date.getDay();
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          return !allowedDays.includes(day);
                        }}
                        locale={dateLocale}
                        className="p-0 border-0 shadow-none bg-transparent w-full"
                      />
                    </div>

                    {/* Date Selected Details */}
                    {selectedDate && (
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">Data inizio:</span>
                          <span className="font-black text-[#043569] uppercase">
                            {format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}
                          </span>
                        </div>
                        {endDate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Fine prevista:</span>
                            <span className="font-bold text-slate-700">
                              {format(endDate, "d MMMM yyyy", { locale: dateLocale })}
                            </span>
                          </div>
                        )}

                        {previewLessons.length > 0 && (
                          <div className="pt-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                              Tutte le lezioni ({previewLessons.length}):
                            </p>
                            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                              {previewLessons.map((les, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-100 text-[#043569] px-2 py-0.5 rounded-md font-bold">
                                  {format(new Date(les.startsAt), "d MMM", { locale: dateLocale })}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`
                  w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95
                  ${canContinue
                    ? "bg-[#F8861D] text-white hover:bg-[#043569] shadow-[#F8861D]/20 hover:shadow-none"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }
                `}
              >
                Procedi al checkout
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
                  <span>Pagamento sicuro e protetto</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headset className="w-4 h-4 text-[#043569] shrink-0" weight="fill" />
                  <span>Supporto e segreteria sempre disponibili</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
