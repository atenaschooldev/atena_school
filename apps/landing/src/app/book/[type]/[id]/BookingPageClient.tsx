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
  CalendarX
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useBooking } from "@/features/booking/hooks/useBooking";
import { calculateLessonDates } from "@/lib/utils/bookingScheduler";

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
  initialUser
}: BookingPageClientProps) {
  const t = useTranslations("booking");
  const dateLocale = it;

  const {
    item,
    isFixedSchedule,
    allowedDays,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedSlotId,
    setSelectedSlotId,
    availableSlots,
    title,
    courseDuration,
    handleContinue
  } = useBooking(type, id, initialItem, initialUser);

  const addMonths = (d: Date, m: number): Date => {
    const res = new Date(d);
    res.setMonth(res.getMonth() + m);
    return res;
  };

  const endDate = selectedDate ? addMonths(selectedDate, 1) : null;
  const previewLessons = (selectedDate && isFixedSchedule)
    ? calculateLessonDates(
      format(selectedDate, "yyyy-MM-dd"),
      item.standard_schedule,
      item.category || "",
      item.standard_schedule,
      item.duration || "1h"
    )
    : [];

  return (
    <main className="min-h-screen py-3 md:py-4 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-[#043569]/[0.02] to-[#F8861D]/[0.03] text-foreground flex items-center justify-center relative">
      {/* Subtle Ambient Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#043569]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F8861D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Unified Wrapper to group header, card, and trust bar */}
      <div className="w-full max-w-6xl 2xl:max-w-7xl flex flex-col space-y-2.5 lg:space-y-3.5 2xl:space-y-7 my-auto relative z-10">
        {/* Standalone Top Header & Stepper Bar */}
        <header className="w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#043569] transition-colors group cursor-pointer mb-0.5"
              >
                <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Torna ai corsi
              </Link>
              <h1 className="text-lg sm:text-xl 2xl:text-3xl font-bold tracking-tight text-[#043569]">
                {isFixedSchedule ? "Attiva il tuo abbonamento" : "Prenota la tua lezione"}
              </h1>
              <p className="text-xs 2xl:text-sm text-slate-500 font-medium mt-0.5">
                {isFixedSchedule
                  ? "Seleziona la data di inizio del tuo abbonamento mensile."
                  : "Scegli la data e l'orario perfetti per la tua lezione individuale."}
              </p>
            </div>

            <div className="shrink-0">
              <CheckoutStepper currentStep={1} />
            </div>
          </div>
        </header>

        {/* Main Unified Booking Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
          {/* Left Area (8 cols): Date & Time Selection */}
          <div className="lg:col-span-8 p-3.5 sm:p-4 lg:p-3.5 2xl:p-7 space-y-2.5 2xl:space-y-5 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 2xl:gap-8 items-start">

              {/* Step 1: Calendar */}
              <div className="space-y-2 2xl:space-y-4 w-full">
                <div className="flex items-center gap-2 font-bold text-xs 2xl:text-sm tracking-wider text-[#043569] border-b border-slate-100 pb-2 select-none">
                  <span className="w-5 h-5 rounded-lg bg-orange-100 text-[#F8861D] text-xs flex items-center justify-center font-bold">1</span>
                  <span>{isFixedSchedule ? "Data di inizio" : "Seleziona la data"}</span>
                </div>

                <div className="border border-slate-200/70 rounded-2xl p-1 lg:p-1.5 2xl:p-3 bg-white shadow-sm flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (isFixedSchedule && date) {
                        setSelectedTime(item.standard_schedule);
                        setSelectedSlotId("fixed_schedule");
                      } else {
                        setSelectedTime(null);
                        setSelectedSlotId(null);
                      }
                    }}
                    locale={dateLocale}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) return true;
                      if (isFixedSchedule) {
                        return !allowedDays.includes(date.getDay());
                      }
                      return date.getDay() === 0 || date.getDay() === 6;
                    }}
                    modifiers={{
                      free: (date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return false;
                        if (isFixedSchedule) {
                          return allowedDays.includes(date.getDay());
                        }
                        return date.getDay() !== 0 && date.getDay() !== 6;
                      }
                    }}
                    className="w-full border-none shadow-none p-0 bg-transparent"
                  />
                </div>

                {/* Need Help Banner */}
                <div className="bg-orange-50/60 border border-orange-100/80 rounded-2xl p-2.5 flex items-center gap-3 select-none">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#F8861D] shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Hai bisogno di aiuto?</p>
                    <p className="text-[11px] text-slate-500 leading-tight">Contattaci per trovare insieme l'orario migliore per te.</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Time Slots */}
              <div className="space-y-2 2xl:space-y-4 w-full">
                <div className="flex items-center justify-between font-bold text-xs 2xl:text-sm tracking-wider text-[#043569] border-b border-slate-100 pb-2 2xl:pb-3 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-slate-100 text-[#043569] text-xs flex items-center justify-center font-bold">2</span>
                    <span>{isFixedSchedule ? "Orario e dettagli" : "Seleziona l'orario"}</span>
                  </div>
                  {selectedDate && availableSlots.length > 0 && (
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">
                      Orari disponibili • {availableSlots.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-2 2xl:space-y-4">
                  {isFixedSchedule ? (
                    <div className="flex-grow flex flex-col justify-between space-y-2 2xl:space-y-4">
                      {!selectedDate ? (
                        <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[200px] 2xl:min-h-[260px] bg-slate-50/50 text-center space-y-1.5 select-none flex-grow">
                          <p className="text-xs font-bold text-slate-700">Nessuna data selezionata</p>
                          <p className="text-[11px] text-slate-400 max-w-[220px]">Seleziona sul calendario il giorno in cui desideri far partire la tua iscrizione.</p>
                        </div>
                      ) : (
                        <div className="flex-grow space-y-2 2xl:space-y-4">
                          {/* Confirmation card */}
                          <div className="p-3 2xl:p-5 border border-orange-100 rounded-2xl bg-orange-50/20 shadow-sm space-y-2 2xl:space-y-4">
                            <div className="flex items-center gap-2 text-xs 2xl:text-sm font-bold text-[#043569]">
                              <span>Orario e Frequenza</span>
                            </div>

                            <div className="space-y-1.5 2xl:space-y-3.5 text-sm 2xl:text-base">
                              {/* Orario standard */}
                              <div className="py-1 2xl:py-2.5 border-b border-slate-100/70">
                                <div className="flex items-center gap-2 text-slate-500 mb-0.5 select-none">
                                  <Clock className="w-4 h-4 2xl:w-4.5 2xl:h-4.5 text-[#F8861D]" />
                                  <span className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest">Orario standard</span>
                                </div>
                                <div className="font-semibold text-[#043569] pl-6 2xl:pl-7 text-sm 2xl:text-base">
                                  {item.standard_schedule}
                                </div>
                              </div>

                              {/* Frequenza */}
                              <div className="py-1 2xl:py-2.5 border-b border-slate-100/70">
                                <div className="flex items-center gap-2 text-slate-500 mb-0.5 select-none">
                                  <CalendarIcon className="w-4 h-4 2xl:w-4.5 2xl:h-4.5 text-[#F8861D]" />
                                  <span className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest">Frequenza</span>
                                </div>
                                <div className="font-semibold text-[#043569] pl-6 2xl:pl-7 text-sm 2xl:text-base">
                                  {courseDuration}
                                </div>
                              </div>

                              {/* Data inizio abbonamento */}
                              <div className="py-1 2xl:py-2.5 border-b border-slate-100/70">
                                <div className="flex items-center gap-2 text-slate-500 mb-0.5 select-none">
                                  <CalendarCheck className="w-4 h-4 2xl:w-4.5 2xl:h-4.5 text-emerald-500" />
                                  <span className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500">Inizio abbonamento</span>
                                </div>
                                <div className="font-semibold text-emerald-600 pl-6 2xl:pl-7 text-sm 2xl:text-base">
                                  {(() => {
                                    const raw = format(selectedDate, "eeee d MMMM yyyy", { locale: dateLocale });
                                    return raw.charAt(0).toUpperCase() + raw.slice(1);
                                  })()}
                                </div>
                              </div>

                              {/* Fine abbonamento */}
                              {endDate && (
                                <div className="py-1 2xl:py-2.5 border-b border-slate-100/70">
                                  <div className="flex items-center gap-2 text-slate-500 mb-0.5 select-none">
                                    <CalendarX className="w-4 h-4 2xl:w-4.5 2xl:h-4.5 text-rose-500" />
                                    <span className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500">Fine abbonamento</span>
                                  </div>
                                  <div className="font-semibold text-rose-600 pl-6 2xl:pl-7 text-sm 2xl:text-base">
                                    {(() => {
                                      const raw = format(endDate, "eeee d MMMM yyyy", { locale: dateLocale });
                                      return raw.charAt(0).toUpperCase() + raw.slice(1);
                                    })()}
                                  </div>
                                </div>
                              )}

                              {/* Date lezioni incluse */}
                              {previewLessons.length > 0 && (
                                <div className="space-y-1.5 pt-2 select-none">
                                  <span className="text-slate-600 font-bold block text-[11px] 2xl:text-xs uppercase tracking-wider">Date lezioni incluse ({previewLessons.length}):</span>
                                  <div className="flex flex-wrap gap-x-2 gap-y-2 pt-1 pb-1">
                                    {previewLessons.map((lesson, idx) => {
                                      const lDate = new Date(lesson.startsAt);
                                      return (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center justify-center bg-orange-50/50 hover:bg-orange-50 text-[#d46a0c] border border-orange-200/30 px-3 py-1 2xl:px-4 2xl:py-1.5 rounded-xl 2xl:rounded-2xl text-[10px] 2xl:text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                                        >
                                          {(() => {
                                            const raw = format(lDate, "d MMMM", { locale: dateLocale });
                                            return raw.charAt(0).toUpperCase() + raw.slice(1);
                                          })()}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {!selectedDate ? (
                        <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 text-center space-y-1.5 select-none">
                          <p className="text-xs font-bold text-slate-700">Nessuna data selezionata</p>
                          <p className="text-[11px] text-slate-400 max-w-[200px]">Clicca su un giorno nel calendario per vedere gli orari disponibili.</p>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="p-5 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[200px] bg-slate-50/50 text-center space-y-1.5 select-none">
                          <WarningCircle className="w-6 h-6 text-amber-500" weight="duotone" />
                          <p className="text-xs font-bold text-slate-700">Nessun orario disponibile</p>
                          <p className="text-[11px] text-slate-400 max-w-[200px]">Non ci sono lezioni libere per la data selezionata.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5 w-full">
                          {availableSlots.map((slot) => {
                            const time = format(new Date(slot.starts_at), "HH:mm");
                            const isSelected = selectedSlotId === slot.id;
                            return (
                              <button
                                key={slot.id}
                                onClick={() => {
                                  setSelectedTime(time);
                                  setSelectedSlotId(slot.id);
                                }}
                                className={`
                                  py-3 px-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center outline-none select-none
                                  ${isSelected
                                    ? "border-2 border-[#F8861D] bg-white shadow-sm"
                                    : "border-slate-200/80 bg-white hover:border-slate-300"}
                                `}
                              >
                                <span className={`text-xs font-bold ${isSelected ? "text-[#F8861D]" : "text-slate-800"}`}>{time}</span>
                                <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-[#F8861D]" : "text-emerald-600"}`}>
                                  {isSelected ? "Selezionato" : "Disponibile"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Dynamic Course Duration Banner */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3 select-none mt-auto">
                        <div className="w-7 h-7 rounded-lg bg-slate-200/60 flex items-center justify-center text-[#043569] shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Durata: {courseDuration}</p>
                          <p className="text-[11px] text-slate-500 leading-tight">Ogni lezione ha una durata di {courseDuration}.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar (4 cols): Integrated Summary */}
          <div className="lg:col-span-4 bg-[#092543] text-white p-4 sm:p-5 2xl:p-8 flex flex-col justify-between space-y-3 2xl:space-y-6">
            <div className="space-y-3 2xl:space-y-6">
              <div className="flex items-center justify-between border-b border-white/15 pb-2 2xl:pb-4">
                <h2 className="text-sm 2xl:text-base font-bold tracking-tight text-white">
                  Riepilogo prenotazione
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] 2xl:text-xs font-medium tracking-wider text-white/80">
                  Passo 1 di 3
                </span>
              </div>

              {/* Items List with Icon Boxes */}
              <div className="space-y-2.5 2xl:space-y-4.5">
                <div className="flex gap-2.5 2xl:gap-3 items-center">
                  <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <GraduationCap className="w-3.5 h-3.5 2xl:w-4.5 2xl:h-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] 2xl:text-[10px] uppercase tracking-wider text-white/50 font-bold select-none">SERVIZIO</p>
                    <p className="font-bold text-xs text-white 2xl:text-sm leading-snug">{title}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 2xl:gap-3 items-center">
                  <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <User className="w-3.5 h-3.5 2xl:w-4.5 2xl:h-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] 2xl:text-[10px] uppercase tracking-wider text-white/50 font-bold select-none">DOCENTE</p>
                    <p className="font-bold text-xs text-white 2xl:text-sm">{item.teacher_name || "Elisabetta Sorrenti"}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 2xl:gap-3 items-center">
                  <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <MapPin className="w-3.5 h-3.5 2xl:w-4.5 2xl:h-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] 2xl:text-[10px] uppercase tracking-wider text-white/50 font-bold select-none">SEDE</p>
                    <p className="font-bold text-xs text-white 2xl:text-sm">Atena School, Via Matteotti 11</p>
                  </div>
                </div>

                {/* Selected Date & Time Rows */}
                <div className="pt-2 2xl:pt-4 border-t border-white/15 space-y-1.5 2xl:space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/70 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-white/70" />
                      <span>Data della prima lezione</span>
                    </div>
                    <span className="font-bold text-white">
                      {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: dateLocale }) : "Non selezionata"}
                    </span>
                  </div>
                  {selectedDate && isFixedSchedule && endDate && (
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-white/70 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-white/70" />
                        <span>Fine abbonamento</span>
                      </div>
                      <span className="font-bold text-white">
                        {format(endDate, "d MMMM yyyy", { locale: dateLocale })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/70 font-medium">
                      <Clock className="w-3.5 h-3.5 text-white/70" />
                      <span>Orario standard</span>
                    </div>
                    <span className="font-bold text-white">{selectedTime || "Non selezionato"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2.5 border-t border-white/15">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs text-white/70 select-none">TOTALE</span>
                <span className="font-extrabold text-white text-2xl">{Number(item.price || 0).toFixed(2)} €</span>
              </div>

              <button
                disabled={!selectedDate || !selectedTime || (!isFixedSchedule && !selectedSlotId)}
                onClick={handleContinue}
                className="w-full py-2.5 px-4 bg-[#F8861D] hover:bg-[#e07516] text-white rounded-xl font-bold text-xs transition-all duration-200 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
              >
                <span>{isFixedSchedule ? "Continua al pagamento" : "Continua ai dettagli"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Bottom Guarantee Badges inside Sidebar */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1.5 text-[9px] text-white/60 text-center select-none">
                <div className="flex flex-col items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-white/80 shrink-0" />
                  <span className="leading-tight">Pagamento sicuro<br />SSL 256-bit</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <CalendarIcon className="w-3 h-3 text-white/80 shrink-0" />
                  <span className="leading-tight">Cancellazione facile<br />Fino a 24h prima</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Headset className="w-3 h-3 text-white/80 shrink-0" />
                  <span className="leading-tight">Supporto dedicato<br />Siamo qui per te</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Trust Bar below Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs text-slate-600 select-none">
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Insegnanti certificati</p>
              <p className="text-[10px] text-slate-400">Qualificati e madrelingua</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <Sparkle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Metodologia efficace</p>
              <p className="text-[10px] text-slate-400">Risultati garantiti</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Flessibilità totale</p>
              <p className="text-[10px] text-slate-400">Orari che si adattano a te</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Oltre 500 studenti</p>
              <p className="text-[10px] text-slate-400">Si sono già fidati di noi</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
