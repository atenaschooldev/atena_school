"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
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
  Sparkle,
  ArrowsClockwise,
} from "@phosphor-icons/react";

import { CourseBillingType } from "@atena/api-types";
import { Calendar } from "@/components/ui/calendar";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { calculateLessonDates, formatCourseScheduleText } from "@/lib/utils/bookingScheduler";
import { ANNUAL_REGISTRATION_FEE_EUR, CourseDetailTab } from "@/constants";

interface CourseDetailClientProps {
  id: string;
  initialCourse: any;
  initialUser: any;
}

export function CourseDetailClient({
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

  const [activeTab, setActiveTab] = useState<CourseDetailTab>(CourseDetailTab.INFO);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const formattedScheduleText = formatCourseScheduleText(
    course?.schedule_days,
    course?.start_time,
    course?.end_time
  );

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = String(cat).toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
    return String(cat);
  };

  const getCourseFormatDetails = (
    formatStr?: any,
    titleStr?: string,
    categoryStr?: string
  ): { label: string; icon: any } => {
    const lowerFormat = String(formatStr || "").toLowerCase();
    const lowerTitle = String(titleStr || "").toLowerCase();
    const lowerCat = String(categoryStr || "").toLowerCase();

    if (lowerCat.includes("certipass") || lowerCat.includes("eipass") || lowerTitle.includes("eipass") || lowerFormat.includes("certif")) {
      return { label: "Certificazione", icon: Certificate };
    }
    if (lowerTitle.includes("individuale") || lowerTitle.includes("privat") || lowerCat.includes("academic") || lowerCat.includes("recupero") || lowerFormat.includes("indiv") || lowerFormat.includes("privat")) {
      return { label: "Corso Individuale", icon: User };
    }
    return { label: "Corso di Gruppo", icon: Users };
  };

  const courseFormat = getCourseFormatDetails(course?.course_format, title, course?.category);
  const FormatIcon = courseFormat.icon;

  const getLessonsPerWeekText = (titleStr: string, scheduleStr?: string): string | null => {
    const lowerTitle = String(titleStr || "").toLowerCase();
    const lowerSchedule = String(scheduleStr || "").toLowerCase();
    if (lowerTitle.includes("c2") || lowerSchedule.includes("c2")) return "3 lezioni a settimana";
    if (lowerTitle.includes("c1") || lowerSchedule.includes("c1")) return "2 lezioni a settimana";
    let count = 0;
    if (lowerSchedule.includes("luned")) count++;
    if (lowerSchedule.includes("marted")) count++;
    if (lowerSchedule.includes("mercoled")) count++;
    if (lowerSchedule.includes("gioved")) count++;
    if (lowerSchedule.includes("venerd")) count++;
    if (lowerSchedule.includes("sabat")) count++;
    if (lowerSchedule.includes("domenic")) count++;
    if (count > 0) return `${count} ${count === 1 ? "lezione" : "lezioni"} a settimana`;
    return null;
  };

  const lessonsPerWeek =
    typeof course?.lessons_per_week === "number" && course.lessons_per_week > 0
      ? `${course.lessons_per_week} ${course.lessons_per_week === 1 ? "lezione" : "lezioni"} a settimana`
      : getLessonsPerWeekText(title, formattedScheduleText);

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

  const billingTypeNum = course?.billing_type !== undefined && course?.billing_type !== null
    ? Number(course.billing_type)
    : CourseBillingType.ONE_TIME_ONLY;
  const subPriceNum = course?.subscription_price !== undefined && course?.subscription_price !== null
    ? Number(course.subscription_price)
    : (course?.price ? parseFloat(String(course.price).replace(/[^0-9.]/g, "")) : 73.2);

  const upcomingDates = useMemo(() => {
    if (!allowedDays || allowedDays.length === 0) return [];
    const dates: Date[] = [];
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    current.setDate(current.getDate() + 1);
    let iterations = 0;
    while (dates.length < 6 && iterations < 45) {
      if (allowedDays.includes(current.getDay())) dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
      iterations++;
    }
    return dates;
  }, [allowedDays]);

  const specs = [
    courseDuration
      ? { icon: Clock, label: "Durata", value: courseDuration, color: "text-amber-600 bg-amber-50" }
      : null,
    { icon: FormatIcon, label: "Formato", value: courseFormat.label, color: "text-blue-600 bg-blue-50" },
    {
      icon: ArrowsClockwise,
      label: "Modalità",
      value: billingTypeNum === CourseBillingType.BOTH
        ? "Saldo o Abbonamento"
        : billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY
        ? "Abbonamento Mensile"
        : "Pagamento Unico",
      color: "text-orange-600 bg-orange-50",
    },
    lessonsPerWeek
      ? { icon: CalendarCheck, label: "Frequenza", value: lessonsPerWeek, color: "text-emerald-600 bg-emerald-50" }
      : null,
    formattedScheduleText && formattedScheduleText !== "Da concordare"
      ? { icon: CalendarIcon, label: "Orario", value: formattedScheduleText, color: "text-purple-600 bg-purple-50" }
      : null,
    course?.teacher_name
      ? { icon: User, label: "Docente", value: course.teacher_name, color: "text-[#043569] bg-[#043569]/10" }
      : null,
  ].filter(Boolean) as { icon: any; label: string; value: string; color: string }[];

  return (
    <main className="bg-slate-100 min-h-screen pt-16 sm:pt-20 pb-28 lg:pb-6 font-sans flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 sm:gap-5">

          {/* ════════════════════════════════════════
              LEFT — Course Detail
          ════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">

            {/* Hero Image with Overlay Title */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg group cursor-default">
              <div className="relative aspect-[16/8] sm:aspect-[16/6] lg:aspect-[16/5.5] xl:aspect-[16/6] w-full max-h-[220px] sm:max-h-[250px] bg-[#043569]">
                {course?.photo_url ? (
                  <Image
                    src={course.photo_url}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#043569] to-[#0a5ba8] flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {course?.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20">
                        {formatCategoryName(course.category)}
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F8861D] text-white flex items-center gap-1.5">
                      <FormatIcon className="w-3 h-3" weight="bold" />
                      {courseFormat.label}
                    </span>
                    {billingTypeNum === CourseBillingType.BOTH && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-1.5 shadow-sm">
                        <ArrowsClockwise className="w-3 h-3" weight="bold" />
                        Abbonamento o Saldo
                      </span>
                    )}
                    {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-1.5 shadow-sm">
                        <ArrowsClockwise className="w-3 h-3" weight="bold" />
                        Abbonamento Mensile
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                    {title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Quick Specs — 2x2 grid on mobile, horizontal row on desktop */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex-shrink-0">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-x-6 sm:gap-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {i > 0 && <div className="w-px h-6 bg-slate-100 flex-shrink-0 hidden sm:block" />}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${spec.color}`}>
                      <spec.icon className="w-3.5 h-3.5" weight="bold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                        {spec.label}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex-shrink-0">
              {/* Tab Bar */}
              <div className="flex border-b border-slate-100">
                {([CourseDetailTab.INFO, CourseDetailTab.INCLUDED] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === tab
                        ? "text-[#043569] border-b-2 border-[#043569] bg-[#043569]/[0.03]"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tab === CourseDetailTab.INFO ? (
                      <>
                        <BookOpen
                          className={`w-4 h-4 ${activeTab === CourseDetailTab.INFO ? "text-[#F8861D]" : ""}`}
                          weight="bold"
                        />
                        Informazioni
                      </>
                    ) : (
                      <>
                        <Trophy
                          className={`w-4 h-4 ${activeTab === CourseDetailTab.INCLUDED ? "text-[#F8861D]" : ""}`}
                          weight="bold"
                        />
                        Cosa è incluso
                      </>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5">
                {activeTab === CourseDetailTab.INFO && (
                  <p className="text-slate-600 leading-relaxed text-[15px] font-medium whitespace-pre-line">
                    {course?.description_it ||
                      course?.description ||
                      "Informazioni sul corso disponibili su richiesta."}
                  </p>
                )}

                {activeTab === CourseDetailTab.INCLUDED && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: "Docenti qualificati",
                        desc: "Lezioni tenute da esperti e madrelingua",
                        color: "bg-blue-50 text-blue-600",
                      },
                      {
                        title: "Materiale didattico",
                        desc: "Dispense, esercizi e risorse digitali",
                        color: "bg-emerald-50 text-emerald-600",
                      },
                      {
                        title: "Attestato finale",
                        desc: "Certificato di frequenza ufficiale Atena",
                        color: "bg-amber-50 text-amber-600",
                      },
                      {
                        title: "Sede & Online",
                        desc: "Frequenza flessibile per ogni esigenza",
                        color: "bg-purple-50 text-purple-600",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors duration-150"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}
                        >
                          <CheckCircle className="w-4 h-4" weight="fill" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT — Booking Sidebar
          ════════════════════════════════════════ */}
          <div className="flex flex-col">
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

              {/* Price Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY ? "Abbonamento Mensile" : "Prezzo Corso"}
                    </p>
                    {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY ? (
                      <p className="text-3xl sm:text-4xl font-black text-[#F8861D] leading-none tracking-tight">
                        {subPriceNum.toFixed(2)}€
                        <span className="text-sm font-bold text-slate-400 ml-1">/mese</span>
                      </p>
                    ) : (
                      <p className="text-3xl sm:text-4xl font-black text-[#F8861D] leading-none tracking-tight">
                        {priceDisplay || "---"}
                      </p>
                    )}
                    {billingTypeNum === CourseBillingType.BOTH && (
                      <p className="text-xs font-bold text-[#043569] mt-2 flex items-center gap-1.5">
                        <ArrowsClockwise className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                        Disponibile anche in abbonamento: <span className="text-[#F8861D] font-black">{subPriceNum.toFixed(2)}€/mese</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Posti disponibili
                  </span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-100">
                  <Info className="w-3.5 h-3.5 text-[#043569] shrink-0 mt-0.5" weight="fill" />
                  <span>
                    Quota iscrizione annuale{" "}
                    <strong className="text-slate-700">{ANNUAL_REGISTRATION_FEE_EUR}€</strong> selezionabile al checkout (valida 12 mesi).
                  </span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="flex-1 p-4 sm:p-5 space-y-3 sm:space-y-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#043569] text-white text-xs font-black flex items-center justify-center shrink-0">
                      1
                    </div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {isFlexibleSchedule ? "Orario personalizzato" : "Scegli la data di inizio"}
                    </h3>
                  </div>
                  {isFixedSchedule && (
                    <button
                      onClick={() => setShowFullCalendar(!showFullCalendar)}
                      className="text-xs text-[#043569] font-semibold hover:underline cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {showFullCalendar ? "Scorciatoie" : "Calendario"}
                    </button>
                  )}
                </div>

                {isFlexibleSchedule ? (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <CalendarCheck className="w-5 h-5 text-[#043569] shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <p className="text-sm font-bold text-[#043569] mb-0.5">Date concordabili</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Dopo l'iscrizione ti contatteremo per fissare insieme giorni e orari più comodi.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!showFullCalendar ? (
                      upcomingDates.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {upcomingDates.map((d, idx) => {
                            const isSelected =
                              selectedDate && selectedDate.toDateString() === d.toDateString();
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedDate(d);
                                  setSelectedTime(formattedScheduleText || "16:00");
                                }}
                                className={`relative p-2.5 sm:p-3 rounded-xl text-center transition-all duration-200 cursor-pointer border-2 select-none ${
                                  isSelected
                                    ? "bg-[#043569] border-[#043569] shadow-lg shadow-[#043569]/20 scale-[1.04]"
                                    : "bg-white border-slate-200 hover:border-[#043569]/30 hover:bg-[#043569]/[0.03] hover:scale-[1.02] active:scale-[0.99]"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5">
                                    <CheckCircle className="w-3 h-3 text-[#F8861D]" weight="fill" />
                                  </div>
                                )}
                                <p
                                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mb-1 ${
                                    isSelected ? "text-blue-200" : "text-slate-400"
                                  }`}
                                >
                                  {format(d, "EEE", { locale: dateLocale })}
                                </p>
                                <p
                                  className={`text-base sm:text-lg font-black leading-none ${
                                    isSelected ? "text-white" : "text-slate-800"
                                  }`}
                                >
                                  {format(d, "d", { locale: dateLocale })}
                                </p>
                                <p
                                  className={`text-[10px] sm:text-[11px] font-semibold leading-none mt-0.5 ${
                                    isSelected ? "text-blue-200" : "text-slate-400"
                                  }`}
                                >
                                  {format(d, "MMM", { locale: dateLocale })}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">
                          Nessuna data disponibile al momento.
                        </p>
                      )
                    ) : (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              setSelectedDate(date);
                              setSelectedTime(formattedScheduleText || "16:00");
                              setShowFullCalendar(false);
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
                    )}

                    {/* Selected date confirmation row */}
                    {selectedDate && (
                      <div className="flex items-center justify-between p-3 bg-[#043569]/[0.05] rounded-xl border border-[#043569]/10">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-[#043569]" weight="bold" />
                          <span className="text-xs font-semibold text-slate-500">Inizio corso:</span>
                        </div>
                        <span className="text-sm font-black text-[#043569]">
                          {format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                    )}

                    {/* Lessons preview pills */}
                    {previewLessons.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {previewLessons.length} lezioni programmate:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previewLessons.slice(0, 12).map((les, idx) => (
                            <span
                              key={idx}
                              className="text-[12px] font-bold bg-white text-[#043569] border border-slate-200 px-2.5 py-1 rounded-lg"
                            >
                              {format(new Date(les.startsAt), "dd/MM", { locale: dateLocale })}
                            </span>
                          ))}
                          {previewLessons.length > 12 && (
                            <span className="text-sm text-slate-400 font-medium px-2 py-2">
                              +{previewLessons.length - 12} altre
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Section (Desktop only - mobile uses sticky bottom bar) */}
              <div className="hidden lg:block mt-auto p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                {!canContinue && !isFlexibleSchedule && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 text-slate-300 text-[11px] font-black flex items-center justify-center shrink-0">
                      2
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Seleziona una data per continuare
                    </span>
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={`
                    w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm
                    flex items-center justify-center gap-2.5
                    transition-all duration-200 cursor-pointer
                    ${canContinue
                      ? "bg-[#F8861D] text-white hover:bg-[#e8741a] shadow-lg shadow-[#F8861D]/25 hover:shadow-xl hover:shadow-[#F8861D]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {canContinue ? (
                    <>
                      <Sparkle className="w-4 h-4" weight="fill" />
                      Procedi al Checkout
                      <ArrowRight className="w-4 h-4" weight="bold" />
                    </>
                  ) : (
                    "Seleziona prima una data"
                  )}
                </button>

                <div className="flex items-center justify-center gap-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" weight="fill" />
                    <span className="font-medium">Pagamento sicuro</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Headset className="w-3.5 h-3.5 text-[#043569]" weight="fill" />
                    <span className="font-medium">Supporto Atena</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-4 py-3 shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY ? "Abbonamento" : "Prezzo corso"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl font-black text-[#F8861D] leading-none">
                {billingTypeNum === CourseBillingType.SUBSCRIPTION_ONLY ? `${subPriceNum.toFixed(2)}€/mese` : (priceDisplay || "---")}
              </p>
              {billingTypeNum === CourseBillingType.BOTH && (
                <span className="text-[10px] font-bold text-[#043569]">
                  (o {subPriceNum.toFixed(2)}€/m)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`
              px-5 py-2.5 rounded-xl font-black uppercase tracking-wide text-xs sm:text-sm
              flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer
              ${canContinue
                ? "bg-[#F8861D] text-white shadow-lg shadow-[#F8861D]/30 active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {canContinue ? "Procedi" : "Scegli data"}
            <ArrowRight className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default CourseDetailClient;
