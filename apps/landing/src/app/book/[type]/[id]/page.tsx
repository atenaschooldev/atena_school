"use client";

import { useState, useEffect, use } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronLeft, 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { format, addMonths, isSameDay, isSunday } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { getSessionId } from "@/lib/utils";

interface BookingItem {
  id: string;
  title_it: string;
  title_en: string;
  price: string | number;
  teacher_name: string;
  teacher_id?: string;
  is_personal: boolean;
  duration_it?: string;
  duration_en?: string;
}

interface ScheduleSlot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
}

export default function BookingPage({ 
  params 
}: { 
  params: Promise<{ type: string; id: string }> 
}) {
  const { type, id } = use(params);
  const locale = 'it';
  const t = useTranslations("booking");
  const router = useRouter();
  const supabase = createClient();
  const dateLocale = it;

  const [item, setItem] = useState<BookingItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Fetch available schedule slots for teacher
  useEffect(() => {
    if (!selectedDate || !item || !item.teacher_id) {
      setAvailableSlots([]);
      return;
    }

    const currentTeacherId = item.teacher_id;

    async function fetchSchedule() {
      const startOfDay = new Date(selectedDate!);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate!);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from("schedule_slots")
        .select("*")
        .eq("teacher_id", currentTeacherId)
        .eq("is_booked", false)
        .gte("starts_at", startOfDay.toISOString())
        .lte("starts_at", endOfDay.toISOString())
        .order("starts_at", { ascending: true });

      if (data) {
        setAvailableSlots(data);
      } else {
        setAvailableSlots([]);
      }
    }
    fetchSchedule();
  }, [selectedDate, item, supabase]);



  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!item) return <div>Item not found</div>;

  const title = item[`title_${locale}` as keyof BookingItem] as string;

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href={type === "course" ? "/courses" : "/shop"}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {locale === "it" ? "Torna alla lista" : "Back to list"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - Left */}
          <div className="lg:col-span-8 space-y-12">
            <header>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
                {locale === "it" ? "Prenota la tua lezione" : "Book your lesson"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {locale === "it" 
                  ? "Scegli la data e l'orario più comodi per te."
                  : "Choose the most convenient date and time for you."}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background p-8 rounded-3xl border border-border/50 shadow-sm">
              {/* Calendar Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {locale === "it" ? "1. Seleziona Data" : "1. Select Date"}
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
                  disabled={(date) => isSunday(date) || date < new Date()}
                  modifiers={{
                    free: (date) => !isSunday(date) && date >= new Date()
                  }}
                  className="rounded-3xl border border-border shadow-xl bg-white p-6"
                />
              </div>

              {/* Time Slots Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  {locale === "it" ? "2. Seleziona Orario" : "2. Select Time"}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.length === 0 ? (
                    <div className="col-span-2 text-center text-sm text-muted-foreground p-4 border-2 border-dashed border-border rounded-xl">
                      {locale === "it" ? "Nessun orario disponibile in questa data." : "No slots available on this date."}
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
                    <AlertCircle className="w-4 h-4" />
                    {locale === "it" ? "Scegli una data prima" : "Pick a date first"}
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
                  {locale === "it" ? "Riepilogo" : "Summary"}
                </h2>

                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
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
                      <p className="font-bold">{item.teacher_name}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Location</p>
                      <p className="font-bold">Atena School, Cittanova</p>
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
                        <CreditCard className="w-5 h-5 opacity-50" />
                        <span className="font-black text-primary">{item.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      disabled={saving || !selectedDate || !selectedSlotId}
                      onClick={() => {
                        const dateStr = format(selectedDate!, "yyyy-MM-dd");
                        const timeStr = selectedTime!;
                        router.push(`/checkout/${type}/${id}?date=${dateStr}&time=${timeStr}&slot_id=${selectedSlotId}`);
                      }}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                    >
                      {locale === "it" ? "Continua" : "Continue"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-50 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                Secure Checkout Simulation
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
