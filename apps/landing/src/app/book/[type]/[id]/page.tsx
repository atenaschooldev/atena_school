"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { 
  CaretLeft, 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar as CalendarIcon,
  CheckCircle,
  WarningCircle
} from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/routing";
import { format, isSunday, isSaturday } from "date-fns";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface BookingItem {
  id: string;
  title_it: string;
  title_en: string;
  duration_it?: string;
  duration_en?: string;
}

interface ScheduleSlot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
}

function BookingPageContent({ 
  params 
}: { 
  params: Promise<{ type: string; id: string }> 
}) {
  const { type, id } = use(params);
  const t = useTranslations("booking");
  const router = useRouter();
  const supabase = createClient();
  const dateLocale = it;
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

  const [item, setItem] = useState<BookingItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(slotIdParam || null);
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch item details
  useEffect(() => {
    async function fetchItem() {
      const table = type === "course" ? "courses" : "shop_items";
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (data) setItem(data);
      setLoading(false);
    }
    fetchItem();
  }, [id, type, supabase]);

  // Fetch user and check auto-redirect
  useEffect(() => {
    async function checkUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      // If user is already logged in, and we returned with all parameters, redirect immediately to checkout!
      if (currentUser && dateParam && timeParam && slotIdParam) {
        router.push(`/checkout/${type}/${id}?date=${dateParam}&time=${timeParam}&slot_id=${slotIdParam}`);
      }
    }
    checkUser();
  }, [supabase, type, id, dateParam, timeParam, slotIdParam, router]);

  // Fetch available slots for the selected date
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    async function fetchSlots() {
      const startOfDay = new Date(selectedDate!);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate!);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("schedule_slots")
        .select("*")
        .gte("starts_at", startOfDay.toISOString())
        .lte("starts_at", endOfDay.toISOString())
        .order("starts_at", { ascending: true });

      if (data) {
        setAvailableSlots(data);
      } else {
        setAvailableSlots([]);
      }
    }

    fetchSlots();
  }, [selectedDate, supabase]);

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const title = item.title_it || (item as any).name || "";

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !selectedSlotId) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    if (!user) {
      // Save state to localStorage as backup
      localStorage.setItem("pending_booking", JSON.stringify({
        type,
        id,
        date: dateStr,
        time: selectedTime,
        slot_id: selectedSlotId
      }));

      // Open deferred auth modal
      setIsAuthModalOpen(true);
    } else {
      router.push(`/checkout/${type}/${id}?date=${dateStr}&time=${selectedTime}&slot_id=${selectedSlotId}`);
    }
  };

  const handleAuthRedirect = () => {
    if (!selectedDate || !selectedTime || !selectedSlotId) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const returnUrl = `/book/${type}/${id}?date=${dateStr}&time=${selectedTime}&slot_id=${selectedSlotId}`;

    router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
  };

  const formattedDateString = selectedDate 
    ? format(selectedDate, "d MMMM yyyy", { locale: dateLocale }) 
    : "";

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/courses"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Torna alla lista
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-12">
            <header>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
                Prenota la tua lezione
              </h1>
              <p className="text-lg text-muted-foreground">
                Scegli la data e l'orario più comodi per te.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background p-4 md:p-8 rounded-3xl border border-border/50 shadow-sm">
              {/* Calendar Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  1. Seleziona Data
                </div>
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
                  className="w-full rounded-3xl border border-border shadow-xl bg-white"
                />
              </div>

              {/* Time Slots Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  2. Seleziona Orario
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.length === 0 ? (
                    <div className="col-span-2 text-center text-sm text-muted-foreground p-4 border-2 border-dashed border-border rounded-xl">
                      Nessun orario disponibile in questa data.
                    </div>
                  ) : (
                    availableSlots.map((slot) => {
                      const time = format(new Date(slot.starts_at), "HH:mm");
                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setSelectedTime(time);
                            setSelectedSlotId(slot.id);
                          }}
                          className={`
                            py-4 px-2 rounded-2xl font-bold transition-all border-2
                            ${selectedSlotId === slot.id 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-background border-border hover:border-primary/50 text-foreground"}
                          `}
                        >
                          {time}
                        </button>
                      );
                    })
                  )}
                </div>

                {!selectedDate && (
                  <div className="p-4 rounded-2xl bg-primary/5 text-primary text-sm flex gap-2 items-center">
                    <WarningCircle className="w-4 h-4" />
                    Scegli una data prima
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right (Service Card) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-foreground text-background rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h2 className="text-2xl font-black uppercase mb-8 relative z-10 border-b border-background/10 pb-4">
                  Riepilogo
                </h2>

                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Service</p>
                      <p className="font-bold text-lg leading-tight">{title}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Teacher</p>
                      <p className="font-bold">{(item as any).teacher_name || "TBD"}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Location</p>
                      <p className="font-bold">Atena School, Via Matteotti 11, Cittanova (RC)</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-background/10 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-50">Date</span>
                      <span className="font-bold">
                        {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: dateLocale }) : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-50">Time</span>
                      <span className="font-bold">{selectedTime || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl pt-4">
                      <span className="font-black uppercase tracking-tight">Total</span>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 opacity-70 text-secondary" />
                        <span className="font-black text-secondary">{(item as any).price} €</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      disabled={!selectedDate || !selectedSlotId}
                      onClick={handleContinue}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-secondary hover:text-secondary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 cursor-pointer"
                    >
                      Continua
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-50 text-xs font-bold uppercase tracking-widest">
                <CheckCircle className="w-4 h-4" />
                Secure Checkout Simulation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deferred Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border border-border shadow-2xl bg-white">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase text-center tracking-tight text-foreground">
              Ultimo passaggio
            </DialogTitle>
            <div className="text-center text-base text-muted-foreground">
              <p className="font-medium text-foreground">
                Ottimo! Per prenotare il {formattedDateString} alle {selectedTime}, non ti resta che accedere al tuo account.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleAuthRedirect}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-secondary hover:text-secondary-foreground transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Accedi / Registrati
            </button>
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="w-full sm:w-auto px-8 py-4 bg-background border-2 border-border text-foreground rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-muted transition-all cursor-pointer"
            >
              Annulla
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function BookingPage(props: any) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <BookingPageContent {...props} />
    </Suspense>
  );
}
