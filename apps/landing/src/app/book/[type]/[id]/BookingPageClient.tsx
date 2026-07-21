"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { fetchScheduleSlotsAction } from "@/app/actions/booking";
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
  Sparkle
} from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/routing";
import { format, isSunday, isSaturday } from "date-fns";
import { it } from "date-fns/locale";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";

interface BookingPageClientProps {
  type: string;
  id: string;
  initialItem: any;
  initialUser: any;
}

interface ScheduleSlot {
  id: string;
  starts_at: string;
  ends_at: string;
}

export default function BookingPageClient({
  type,
  id,
  initialItem,
  initialUser
}: BookingPageClientProps) {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateLocale = it;

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

  const [item] = useState<any>(initialItem);
  const [user, setUser] = useState<any>(initialUser);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(slotIdParam || null);
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    if (user && dateParam && timeParam && slotIdParam) {
      router.push(`/checkout/${type}/${id}?date=${dateParam}&time=${timeParam}&slot_id=${slotIdParam}`);
    }
  }, [user, type, id, dateParam, timeParam, slotIdParam, router]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    async function fetchSlots() {
      try {
        const dateStr = format(selectedDate!, "yyyy-MM-dd");
        const res = await fetchScheduleSlotsAction(dateStr);
        if (res.success) {
          setAvailableSlots(res.slots || []);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    }

    fetchSlots();
  }, [selectedDate]);

  const title = item.title_it || item.name || "Lezione / Corso Atena";
  const courseDuration = item.duration_it || item.duration || (item.hours ? `${item.hours} ore` : item.duration_minutes ? `${item.duration_minutes} min` : "60 minuti");

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !selectedSlotId) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    router.push(`/checkout/${type}/${id}?date=${dateStr}&time=${selectedTime}&slot_id=${selectedSlotId}`);
  };

  return (
    <main className="min-h-screen pt-3 pb-6 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-[#043569]/[0.02] to-[#F8861D]/[0.03] text-foreground flex flex-col justify-between items-center relative">
      {/* Subtle Ambient Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#043569]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F8861D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Standalone Top Header & Stepper Bar */}
      <header className="w-full max-w-6xl mx-auto pt-1 pb-3 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#043569] transition-colors group cursor-pointer mb-0.5"
            >
              <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Torna ai corsi
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#043569]">
              Prenota la tua lezione
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Scegli la data e l'orario perfetti per la tua lezione individuale.
            </p>
          </div>

          <div className="shrink-0">
            <CheckoutStepper currentStep={1} />
          </div>
        </div>
      </header>

      {/* Main Centered Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center items-center space-y-3.5 my-auto relative z-10">
        {/* Main Unified Booking Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
          {/* Left Area (8 cols): Date & Time Selection */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Step 1: Calendar */}
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2 font-bold text-xs tracking-wider text-[#043569] border-b border-slate-100 pb-2.5 select-none">
                  <span className="w-5 h-5 rounded-lg bg-orange-100 text-[#F8861D] text-xs flex items-center justify-center font-bold">1</span>
                  <span>Seleziona la data</span>
                </div>
                
                <div className="border border-slate-200/70 rounded-2xl p-2.5 bg-white shadow-sm flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                      setSelectedSlotId(null);
                    }}
                    locale={dateLocale}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return isSunday(date) || isSaturday(date) || date < today;
                    }}
                    modifiers={{
                      free: (date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return !isSunday(date) && !isSaturday(date) && date >= today;
                      }
                    }}
                    className="w-full border-none shadow-none p-0 bg-transparent"
                  />
                </div>

                {/* Need Help Banner */}
                <div className="bg-orange-50/60 border border-orange-100/80 rounded-2xl p-3 flex items-center gap-3 select-none">
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
              <div className="space-y-3 flex flex-col h-full w-full">
                <div className="flex items-center justify-between font-bold text-xs tracking-wider text-[#043569] border-b border-slate-100 pb-2.5 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-slate-100 text-[#043569] text-xs flex items-center justify-center font-bold">2</span>
                    <span>Seleziona l'orario</span>
                  </div>
                  {selectedDate && availableSlots.length > 0 && (
                    <span className="text-[11px] font-semibold text-slate-400 normal-case">
                      Orari disponibili • {availableSlots.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
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
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar (4 cols): Integrated Summary */}
          <div className="lg:col-span-4 bg-[#092543] text-white p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Riepilogo prenotazione
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium tracking-wider text-white/80">
                  Passo 1 di 3
                </span>
              </div>

              {/* Items List with Icon Boxes */}
              <div className="space-y-3">
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold select-none">SERVIZIO</p>
                    <p className="font-bold text-xs text-white leading-snug">{title}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold select-none">DOCENTE</p>
                    <p className="font-bold text-xs text-white">{item.teacher_name || "Elisabetta Sorrenti"}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold select-none">SEDE</p>
                    <p className="font-bold text-xs text-white">Atena School, Via Matteotti 11</p>
                  </div>
                </div>

                {/* Selected Date & Time Rows */}
                <div className="pt-2.5 border-t border-white/15 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/70 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-white/70" />
                      <span>Data scelta</span>
                    </div>
                    <span className="font-bold text-white">
                      {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: dateLocale }) : "Non selezionata"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-white/70 font-medium">
                      <Clock className="w-3.5 h-3.5 text-white/70" />
                      <span>Orario scelto</span>
                    </div>
                    <span className="font-bold text-white">{selectedTime || "Non selezionato"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/15">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-xs text-white/70 select-none">TOTALE</span>
                <span className="font-extrabold text-white text-2xl">{Number(item.price || 0).toFixed(2)} €</span>
              </div>

              <button
                disabled={!selectedDate || !selectedTime || !selectedSlotId}
                onClick={handleContinue}
                className="w-full py-3 px-5 bg-[#F8861D] hover:bg-[#e07516] text-white rounded-xl font-bold text-xs transition-all duration-200 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
              >
                <span>Continua ai dettagli</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Bottom Guarantee Badges inside Sidebar */}
              <div className="pt-2.5 border-t border-white/10 grid grid-cols-3 gap-1.5 text-[9px] text-white/60 text-center select-none">
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
