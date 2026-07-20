"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { fetchScheduleSlotsAction } from "@/app/actions/booking";
import {
  CaretLeft,
  Clock,
  User,
  MapPin,
  CreditCard,
  Calendar as CalendarIcon,
  CheckCircle,
  WarningCircle,
  Sparkle,
  ArrowRight
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

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !selectedSlotId) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    router.push(`/checkout/${type}/${id}?date=${dateStr}&time=${selectedTime}&slot_id=${selectedSlotId}`);
  };

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden py-6 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-[#043569]/[0.02] to-[#F8861D]/[0.03] text-foreground flex items-center justify-center relative">
      {/* Subtle Ambient Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#043569]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F8861D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10">
        {/* Back Link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#043569] transition-colors group cursor-pointer mb-1"
            >
              <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Torna ai corsi
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#043569]">
              Prenota la tua lezione
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Seleziona la data e l'orario ideale per le tue lezioni individuali.
            </p>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="w-full">
          <CheckoutStepper currentStep={1} />
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Step 1: Calendar (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col space-y-4 w-full">
            <div className="flex items-center gap-3 font-black text-sm uppercase tracking-wider text-[#043569] border-b border-slate-100 pb-3.5 select-none">
              <div className="w-8 h-8 rounded-xl bg-[#F8861D]/10 flex items-center justify-center text-[#F8861D]">
                <CalendarIcon className="w-5 h-5" weight="duotone" />
              </div>
              <span>1. Seleziona Data</span>
            </div>
            <div className="flex justify-center w-full pt-1">
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
          </div>

          {/* Step 2: Time Slots (4 cols) */}
          <div className="md:col-span-7 lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col space-y-4 w-full">
            <div className="flex items-center gap-3 font-black text-sm uppercase tracking-wider text-[#043569] border-b border-slate-100 pb-3.5 select-none">
              <div className="w-8 h-8 rounded-xl bg-[#043569]/10 flex items-center justify-center text-[#043569]">
                <Clock className="w-5 h-5" weight="duotone" />
              </div>
              <span>2. Seleziona Orario</span>
            </div>

            <div className="flex-grow flex flex-col justify-between w-full">
              {!selectedDate ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 text-center space-y-2 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8861D]/10 flex items-center justify-center text-[#F8861D]">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Nessuna data selezionata</p>
                  <p className="text-xs text-slate-400">Clicca su un giorno nel calendario per vedere gli orari disponibili.</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 text-center space-y-2 select-none">
                  <WarningCircle className="w-10 h-10 text-amber-500" weight="duotone" />
                  <p className="text-sm font-bold text-slate-700">Nessun orario disponibile</p>
                  <p className="text-xs text-slate-400">Non ci sono lezioni libere per la data selezionata. Scegli un altro giorno.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
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
                          py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 border cursor-pointer text-center text-sm w-full outline-none flex items-center justify-center gap-2
                          ${isSelected
                            ? "bg-gradient-to-r from-[#F8861D] to-[#ff9833] text-white border-[#F8861D] shadow-lg shadow-[#F8861D]/30 scale-[1.02]"
                            : "bg-slate-50 border-slate-200 hover:border-[#F8861D] hover:bg-[#F8861D]/5 hover:text-[#F8861D] text-slate-700 shadow-sm"}
                        `}
                      >
                        <Clock className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                        <span>{time}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Riepilogo (4 cols) */}
          <div className="md:col-span-12 lg:col-span-4 w-full">
            <div className="bg-gradient-to-b from-[#043569] via-[#053d78] to-[#022347] text-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#043569]/30 relative overflow-hidden border border-[#043569] space-y-5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#F8861D]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3.5 relative z-10">
                <h2 className="text-lg font-black uppercase tracking-wider">
                  Riepilogo
                </h2>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider text-[#F8861D]">
                  Passo 1 di 3
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex gap-3.5 items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[#F8861D]/20 flex items-center justify-center shrink-0 text-[#F8861D]">
                    <Sparkle className="w-5 h-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold select-none">Servizio</p>
                    <p className="font-bold text-sm leading-tight text-white">{title}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/80">
                    <User className="w-5 h-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold select-none">Docente</p>
                    <p className="font-bold text-xs text-white">{item.teacher_name || "Elisabetta Sorrenti"}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/80">
                    <MapPin className="w-5 h-5" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold select-none">Sede</p>
                    <p className="font-bold text-xs text-white">Atena School, Via Matteotti 11</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium select-none">Data scelta</span>
                    <span className="font-bold text-white">
                      {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: dateLocale }) : "Non selezionata"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium select-none">Orario scelto</span>
                    <span className="font-bold text-white">{selectedTime || "Non selezionato"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl pt-3 border-t border-white/10">
                    <span className="font-black uppercase tracking-wider text-xs text-white/80 select-none">Totale</span>
                    <span className="font-black text-white text-2xl">{item.price} €</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={!selectedDate || !selectedTime || !selectedSlotId}
                    onClick={handleContinue}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#F8861D] via-[#f99232] to-[#FF9D3B] hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 shadow-xl shadow-[#F8861D]/35 hover:shadow-2xl hover:shadow-[#F8861D]/50 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Continua ai Dettagli</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
