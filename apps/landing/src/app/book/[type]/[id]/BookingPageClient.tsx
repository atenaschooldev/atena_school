"use client";

import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import {
  CaretLeft,
  Clock,
  Calendar as CalendarIcon,
  WarningCircle,
  ArrowRight,
  GraduationCap,
  User,
  MapPin,
  ShieldCheck,
  Headset,
  Sparkle,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Star,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { calculateLessonDates, formatCourseScheduleText } from "@/lib/utils/bookingScheduler";

interface BookingPageClientProps {
  type: string;
  id: string;
  initialItem: any;
  initialUser: any;
}

export default function BookingPageClient({
  type,
  id,
  initialItem,
  initialUser,
}: BookingPageClientProps) {
  const t = useTranslations("booking");
  const dateLocale = it;

  const {
    item,
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
  } = useBooking(type, id, initialItem, initialUser);

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };

  const formattedScheduleText = formatCourseScheduleText(item?.schedule_days, item?.start_time, item?.end_time);

  const endDate = selectedDate ? addMonths(selectedDate, 1) : null;
  const previewLessons =
    selectedDate && isFixedSchedule
      ? calculateLessonDates(
        format(selectedDate, "yyyy-MM-dd"),
        item?.start_time || "16:00",
        item?.category || "",
        item?.schedule_days,
        item?.lesson_duration_minutes || 60,
        item?.start_time,
        item?.end_time,
        item?.schedule_type
      )
      : [];

  const canContinue = isFlexibleSchedule || (!!selectedDate && !!selectedTime);

  return (
    <main className="min-h-screen bg-white flex flex-col relative overflow-hidden">


      {/* Top nav bar */}
      <div className="relative z-10 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/corsi"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#043569] transition-all group"
          >
            <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Torna ai corsi
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-2.5 2xl:py-5 flex flex-col gap-2.5 2xl:gap-4">

          {/* Page header */}
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-black tracking-tight text-[#043569] leading-tight">
              {isFlexibleSchedule
                ? "Prenota corso a orario flessibile"
                : isFixedSchedule
                  ? "Prenota il tuo corso"
                  : "Prenota la tua lezione"}
            </h1>
            <p className="text-xs 2xl:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              {isFlexibleSchedule
                ? "Questo corso ha un orario flessibile. I giorni e gli orari delle lezioni verranno concordati con la scuola."
                : isFixedSchedule
                  ? "Scegli la data di inizio del corso e conferma la prenotazione."
                  : "Scegli la data e l'orario perfetti per la tua lezione individuale."}
            </p>
          </div>
          {/* Stepper */}
          <div>
            <CheckoutStepper currentStep={1} />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-5 2xl:gap-6 items-stretch">

            {/* LEFT: Selection area */}
            <div className="flex flex-col gap-4 2xl:gap-5 h-full">

              {isFlexibleSchedule ? (
                /* Flexible Schedule Card */
                <div className="bg-white/80 backdrop-blur-sm border border-slate-100/90 rounded-2xl 2xl:rounded-3xl shadow-[0_2px_24px_rgba(4,53,105,0.06)] p-5 2xl:p-6 flex flex-col justify-between gap-5 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#F8861D]/10 border border-[#F8861D]/20 flex items-center justify-center text-[#F8861D] shrink-0">
                        <Sparkle className="w-5 h-5" weight="fill" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#043569]">Orario Flessibile &amp; Personalizzato</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Non è necessario selezionare data e ora adesso</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#043569] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">Durata e Frequenza</p>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{courseDuration}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                        <CalendarIcon className="w-4 h-4 text-[#043569] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">Programmazione</p>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">Da concordare direttamente con la segreteria</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-[#043569] leading-relaxed space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-[#043569]">
                        <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                        Come funziona dopo la prenotazione?
                      </p>
                      <p className="text-slate-600 pl-5">
                        Dopo aver completato l'ordine, il nostro staff ti contatterà per definire il calendario delle lezioni in base alle tue disponibilità.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step pills row for Fixed / Slot-based Schedule */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-5 flex-1">

                  {/* Step 1: Calendar card */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/90 rounded-2xl 2xl:rounded-3xl shadow-[0_2px_24px_rgba(4,53,105,0.06)] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2.5 px-4 2xl:px-5 pt-4 2xl:pt-5 pb-3 border-b border-slate-100/80">
                      <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-lg bg-gradient-to-br from-[#F8861D] to-[#e07516] text-white text-[10px] 2xl:text-xs flex items-center justify-center font-black shadow-sm">
                        1
                      </span>
                      <span className="text-xs 2xl:text-sm font-bold text-[#043569] tracking-wide">
                        {isFixedSchedule ? "Data di inizio" : "Seleziona la data"}
                      </span>
                    </div>
                    <div className="p-2 2xl:p-3 flex justify-center min-h-[290px] 2xl:min-h-[340px] items-start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date: Date | undefined) => {
                          setSelectedDate(date);
                          if (isFixedSchedule && date) {
                            setSelectedTime(item?.start_time ? `${item.start_time}-${item.end_time || ""}` : "");
                          } else {
                            setSelectedTime(null);
                          }
                        }}
                        locale={dateLocale}
                        disabled={(date: Date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (isFixedSchedule) {
                            return !allowedDays.includes(date.getDay());
                          }
                          return date.getDay() === 0 || date.getDay() === 6;
                        }}
                        modifiers={{
                          free: (date: Date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return false;
                            if (isFixedSchedule) {
                              return allowedDays.includes(date.getDay());
                            }
                            return date.getDay() !== 0 && date.getDay() !== 6;
                          },
                        }}
                        className="w-full border-none shadow-none p-0 bg-transparent"
                        fixedWeeks
                      />
                    </div>
                  </div>

                  {/* Step 2: Time/Details card */}
                  <div className="bg-white/80 backdrop-blur-sm border border-white/90 rounded-2xl 2xl:rounded-3xl shadow-[0_2px_24px_rgba(4,53,105,0.06)] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 2xl:px-5 pt-4 2xl:pt-5 pb-3 border-b border-slate-100/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-lg bg-gradient-to-br from-[#043569] to-[#0a4a8c] text-white text-[10px] 2xl:text-xs flex items-center justify-center font-black shadow-sm">
                          2
                        </span>
                        <span className="text-xs 2xl:text-sm font-bold text-[#043569] tracking-wide">
                          {isFixedSchedule ? "Orario e dettagli" : "Seleziona l'orario"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 2xl:p-5 flex flex-col gap-3 2xl:gap-4">
                      {isFixedSchedule ? (
                        !selectedDate ? (
                          /* Fixed schedule – no date selected */
                          <div className="flex flex-col items-center justify-center min-h-[240px] 2xl:min-h-[300px] text-center gap-3 select-none">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                              <CalendarIcon className="w-5 h-5 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-600">Seleziona una data</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                                Scegli la data di inizio sul calendario per vedere i dettagli del corso.
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Fixed schedule details */
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 select-none">
                              Dettagli del corso
                            </div>

                            {/* Detail rows */}
                            {[
                              {
                                icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
                                label: "Orario standard",
                                value: formattedScheduleText,
                                color: "text-[#043569]",
                              },
                              {
                                icon: <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />,
                                label: "Frequenza",
                                value: courseDuration,
                                color: "text-[#043569]",
                              },
                            ].map((row) => (
                              <div
                                key={row.label}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/60 border border-slate-100/80"
                              >
                                <div className="flex items-center gap-2 select-none">
                                  {row.icon}
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {row.label}
                                  </span>
                                </div>
                                <span className={`text-xs font-bold ${row.color} text-right max-w-[55%]`}>
                                  {row.value}
                                </span>
                              </div>
                            ))}

                            {/* Start date */}
                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
                              <div className="flex items-center gap-2 select-none">
                                <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                  Inizio
                                </span>
                              </div>
                              <span className="text-xs font-bold text-emerald-600 text-right">
                                {(() => {
                                  const raw = format(selectedDate, "d MMMM yyyy", { locale: dateLocale });
                                  return raw.charAt(0).toUpperCase() + raw.slice(1);
                                })()}
                              </span>
                            </div>

                            {/* End date */}
                            {endDate && (
                              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50/60 border border-rose-100/80">
                                <div className="flex items-center gap-2 select-none">
                                  <CalendarX className="w-3.5 h-3.5 text-rose-500" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                                    Fine
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-rose-600 text-right">
                                  {(() => {
                                    const raw = format(endDate, "d MMMM yyyy", { locale: dateLocale });
                                    return raw.charAt(0).toUpperCase() + raw.slice(1);
                                  })()}
                                </span>
                              </div>
                            )}

                            {/* Lesson date badges */}
                            {previewLessons.length > 0 && (
                              <div className="pt-1 select-none">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                                  Date incluse ({previewLessons.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {previewLessons.map((lesson, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#043569]/6 border border-[#043569]/10 text-[10px] font-bold text-[#043569] whitespace-nowrap"
                                    >
                                      {format(new Date(lesson.startsAt), "d MMMM", { locale: dateLocale })}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[240px] text-center gap-3 select-none">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-600">Durata corso</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{courseDuration}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Summary sidebar */}
            <div className="lg:sticky lg:top-6 flex flex-col h-full">
              <div className="bg-[#062d5e] rounded-2xl 2xl:rounded-3xl overflow-hidden shadow-2xl shadow-[#043569]/20 flex flex-col h-full">

                {/* Sidebar header */}
                <div className="px-4 2xl:px-5 pt-3.5 2xl:pt-4 pb-2.5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs 2xl:text-sm font-bold text-white">Riepilogo prenotazione</h2>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-white/8 px-2 py-0.5 rounded-full">
                      Passo 1 di 3
                    </span>
                  </div>
                </div>

                {/* Course info */}
                <div className="px-4 2xl:px-5 py-2.5 2xl:py-3 space-y-2 2xl:space-y-2.5">
                  {[
                    { icon: <GraduationCap className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "SERVIZIO", value: title },
                    { icon: <User className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "DOCENTE", value: initialItem?.teacher_name || "Staff Atena" },
                    { icon: <MapPin className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "SEDE", value: "Atena School, Via Matteotti 11" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0 text-white/70 mt-0.5">
                        {row.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] 2xl:text-[10px] font-black uppercase tracking-widest text-white/35 select-none">
                          {row.label}
                        </p>
                        <p className="text-xs 2xl:text-sm font-bold text-white leading-snug mt-0.5 break-words">
                          {row.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="px-4 2xl:px-5 py-2.5 2xl:py-3 space-y-2 2xl:space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 select-none">
                      Totale
                    </span>
                    <div className="text-right">
                      <span className="text-xl 2xl:text-2xl font-black text-white">
                        {Number(initialItem?.price || 0).toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canContinue}
                    onClick={handleContinue}
                    className="Btn-orange"
                  >
                    <span>{isFixedSchedule ? "Procedi al Checkout" : "Procedi al Checkout"}</span>
                    <svg className="svgIcon" viewBox="0 0 512 512">
                      <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h370.7l-75.4 75.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"></path>
                    </svg>
                  </button>

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-white/12 text-center select-none">
                    {[
                      { icon: <ShieldCheck className="w-4 h-4 text-white/70" />, label: "Pagamento sicuro", sub: "SSL 256-bit" },
                      { icon: <CalendarIcon className="w-4 h-4 text-white/70" />, label: "Cancellazione", sub: "Fino 24h prima" },
                      { icon: <Headset className="w-4 h-4 text-white/70" />, label: "Supporto", sub: "Sempre attivo" },
                    ].map((badge) => (
                      <div key={badge.label} className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                        <span>{badge.icon}</span>
                        <span className="text-[10px] text-white/90 leading-snug font-bold">{badge.label}</span>
                        <span className="text-[9px] text-white/60 leading-tight">{badge.sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
