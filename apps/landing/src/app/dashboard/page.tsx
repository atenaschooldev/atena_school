"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, CheckCircle, BookmarkSimple, ArrowLeft } from "@phosphor-icons/react";
import { format, isFuture, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";

interface EnrichedBooking {
  id: string;
  item_id: string;
  item_type: string;
  item_title: string;
  price: number;
  teacher_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  slot_starts_at?: string;
  is_future: boolean;
}

export default function DashboardPage() {
  const dateLocale = it;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  // Profile Settings Form states
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Get logged in User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // 2. Fetch all paid/completed bookings for the user
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["paid", "completed", "reserved", "pending_payment"])
        .order("created_at", { ascending: false });

      const userBookings: any[] = data || [];

      // 3. Find IDs of courses, shop items, slots
      const courseIds = Array.from(new Set(userBookings.filter((b: any) => b.item_type === "course").map((b: any) => b.item_id))) as string[];
      const shopItemIds = Array.from(new Set(userBookings.filter((b: any) => b.item_type === "shop").map((b: any) => b.item_id))) as string[];
      const slotIds = Array.from(new Set(userBookings.filter((b: any) => b.slot_id).map((b: any) => b.slot_id))) as string[];

      // 4. Parallel Data Fetching
      const promises: Promise<any>[] = [];
      let coursesData: any[] = [];
      let shopItemsData: any[] = [];
      let slotsData: any[] = [];

      if (courseIds.length > 0) {
        // @ts-ignore
        promises.push(supabase.from("courses").select("*").in("id", courseIds).then(res => coursesData = res.data || []));
      }
      if (shopItemIds.length > 0) {
        // @ts-ignore
        promises.push(supabase.from("shop_items").select("*").in("id", shopItemIds).then(res => shopItemsData = res.data || []));
      }
      if (slotIds.length > 0) {
        // @ts-ignore
        promises.push(supabase.from("schedule_slots").select("*").in("id", slotIds).then(res => slotsData = res.data || []));
      }

      await Promise.all(promises);

      // Maps for quick access
      const coursesMap = Object.fromEntries(coursesData.map(c => [c.id, c]));
      const shopItemsMap = Object.fromEntries(shopItemsData.map(s => [s.id, s]));
      const slotsMap = Object.fromEntries(slotsData.map(s => [s.id, s]));

      // 5. Build enriched bookings
      const enriched: EnrichedBooking[] = userBookings.map(b => {
        const itemObj = b.item_type === "course" ? coursesMap[b.item_id] : shopItemsMap[b.item_id];
        const slotObj = b.slot_id ? slotsMap[b.slot_id] : null;

        let isSlotFuture = false;

        // Check if date is in the future
        if (slotObj && slotObj.starts_at) {
          isSlotFuture = isFuture(parseISO(slotObj.starts_at));
        } else if (b.booking_date) {
          isSlotFuture = isFuture(new Date(b.booking_date));
        }

        return {
          id: b.id,
          item_id: b.item_id,
          item_type: b.item_type,
          item_title: itemObj ? (itemObj.title_it || itemObj.name || "Item Unavailable") : "Item Unavailable",
          price: itemObj ? (itemObj as any).price : 0,
          teacher_name: itemObj ? (itemObj as any).teacher_name : "TBD",
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          status: b.status,
          slot_starts_at: slotObj?.starts_at,
          is_future: isSlotFuture
        };
      });

      // Sort: Upcoming (future) first, then by nearest date. If past, then newest past date first.
      enriched.sort((a, b) => {
        const timeA = a.slot_starts_at ? new Date(a.slot_starts_at).getTime() : new Date(a.booking_date).getTime();
        const timeB = b.slot_starts_at ? new Date(b.slot_starts_at).getTime() : new Date(b.booking_date).getTime();
        
        if (a.is_future && b.is_future) return timeA - timeB; // nearest upcoming
        if (!a.is_future && !b.is_future) return timeB - timeA; // newest completed
        return a.is_future ? -1 : 1;
      });

      setBookings(enriched);
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  // Sync profile details when user is fetched
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.full_name || "");
      setProfilePhone(user.user_metadata?.phone || user.phone || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName,
          phone: profilePhone
        }
      });

      if (error) throw error;
      
      setUser(data.user);
      toast.success("Profilo aggiornato con successo!");
    } catch (err: any) {
      toast.error(err.message || "Impossibile aggiornare il profilo");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const upcomingLessons = bookings.filter(b => b.is_future);
  const pastLessons = bookings.filter(b => !b.is_future);
  const activeBookings = activeTab === "upcoming" ? upcomingLessons : pastLessons;

  return (
    <main className="min-h-screen pt-20 md:pt-32 pb-20 px-4 sm:px-6 bg-[#f8f9fa] text-foreground">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-[#043569] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Torna ai Corsi
          </Link>
        </div>

        {/* Header Section */}
        <header className="mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#043569] mb-2 leading-none">
            Area Personale
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Gestisci le tue lezioni, acquisti e pianificazioni.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar / Left Column (User Profile & CTA) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* User Profile Card */}
            <div className="bg-[#043569] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Decorative Blur Bubble */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Initial Avatar */}
                <div className="w-20 h-20 bg-gradient-to-tr from-[#F8861D] to-[#ffaa55] text-white rounded-full flex items-center justify-center text-3xl font-black shadow-lg mb-4 select-none">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                  {user?.user_metadata?.full_name || 'Studente'}
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mb-6 font-medium break-all max-w-full px-2">
                  {user?.email}
                </p>

                {/* Statistics Row */}
                <div className="grid grid-cols-2 gap-4 w-full border-t border-white/10 pt-6">
                  <div className="text-center border-r border-white/10 pr-2">
                    <p className="text-2xl font-black text-[#F8861D]">{upcomingLessons.length}</p>
                    <p className="text-[10px] uppercase font-black text-white/50 tracking-wider">In Arrivo</p>
                  </div>
                  <div className="text-center pl-2">
                    <p className="text-2xl font-black text-white">{pastLessons.length}</p>
                    <p className="text-[10px] uppercase font-black text-white/50 tracking-wider">Completati</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Settings Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-sm flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-black uppercase text-[#043569]">
                I tuoi dati
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#fdfdfd] text-sm font-medium focus:outline-none focus:border-[#F8861D] transition-colors"
                    placeholder="Nome e Cognome"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#fdfdfd] text-sm font-medium focus:outline-none focus:border-[#F8861D] transition-colors"
                    placeholder="Inserisci il telefono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-3 bg-[#043569] text-white hover:bg-[#F8861D] disabled:opacity-50 rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all cursor-pointer shadow-md shadow-[#043569]/10 active:scale-95"
              >
                {savingProfile ? "Salvataggio..." : "Salva Profilo"}
              </button>
            </div>

            {/* Quick CTA Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border/50 shadow-sm flex flex-col gap-4">
              <h3 className="text-base sm:text-lg font-black uppercase text-[#043569]">
                Vuoi imparare altro?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium opacity-90">
                Esplora la nostra offerta formativa e prenota nuove lezioni con i migliori tutor e insegnanti qualificati.
              </p>
              <Link
                href="/courses"
                className="w-full py-3.5 bg-[#F8861D] text-white hover:bg-[#043569] rounded-xl text-xs font-black uppercase tracking-widest text-center transition-all shadow-md shadow-[#F8861D]/15 hover:shadow-none active:scale-95 cursor-pointer block"
              >
                Esplora Corsi
              </Link>
            </div>

          </div>

          {/* Right Column (Appointments with Tabs) */}
          <div className="lg:col-span-8 w-full">
            
            <section className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
              
              {/* Tabs Switcher */}
              <div className="flex border-b border-border bg-[#fdfdfd] px-2 sm:px-4">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-4 sm:px-6 py-4 font-black uppercase text-[11px] sm:text-xs tracking-wider transition-all border-b-2 cursor-pointer outline-none ${
                    activeTab === "upcoming"
                      ? "border-[#F8861D] text-[#F8861D]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  In Arrivo ({upcomingLessons.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-4 sm:px-6 py-4 font-black uppercase text-[11px] sm:text-xs tracking-wider transition-all border-b-2 cursor-pointer outline-none ${
                    activeTab === "past"
                      ? "border-[#F8861D] text-[#F8861D]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Storico Lezioni ({pastLessons.length})
                </button>
              </div>

              {/* List of activeBookings */}
              {activeBookings.length === 0 ? (
                <div className="text-center py-20 px-6 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/60">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {activeTab === "upcoming" ? "Nessun appuntamento attivo" : "Nessuno storico lezioni"}
                  </p>
                  <p className="text-xs sm:text-sm max-w-sm mx-auto opacity-80 leading-relaxed font-medium">
                    {activeTab === "upcoming" 
                      ? "Non hai lezioni programmate per il futuro. Esplora i nostri corsi per iniziare!"
                      : "Non hai ancora partecipato a nessuna lezione passata."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {activeBookings.map((booking) => {
                    const dateDisplay = booking.slot_starts_at 
                      ? format(parseISO(booking.slot_starts_at), "dd MMMM yyyy", { locale: dateLocale })
                      : (booking.booking_date ? format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: dateLocale }) : "---");
                      
                    const timeDisplay = booking.slot_starts_at
                      ? format(parseISO(booking.slot_starts_at), "HH:mm")
                      : booking.booking_time || "---";

                    return (
                      <div 
                        key={booking.id} 
                        className="group p-6 sm:p-8 hover:bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Title & Teacher Info */}
                        <div className="flex-1 space-y-1">
                          <h4 className="text-lg sm:text-xl font-black text-[#043569] group-hover:text-[#F8861D] transition-colors leading-tight">
                            {booking.item_title}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                            Docente: <span className="font-bold text-foreground">{booking.teacher_name}</span>
                          </p>
                        </div>

                        {/* Date & Time Badge */}
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/80 font-bold bg-muted/40 px-3.5 py-2 rounded-xl self-start md:self-auto border border-border/20 shadow-sm select-none">
                          <Calendar className="w-4.5 h-4.5 text-[#F8861D]" />
                          <span>{dateDisplay}</span>
                          <span className="text-muted-foreground/40 font-normal">|</span>
                          <Clock className="w-4.5 h-4.5 text-[#F8861D]" />
                          <span>{timeDisplay}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start md:self-auto shrink-0 select-none">
                          {booking.status === "reserved" ? (
                            <div className="flex items-center gap-1 text-secondary bg-secondary/10 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                              <BookmarkSimple className="w-3.5 h-3.5" weight="fill" />
                              Prenotato
                            </div>
                          ) : booking.status === "pending_payment" ? (
                            <div className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              In attesa
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 bg-green-500/10 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              Pagato
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            
          </div>

        </div>

      </div>
    </main>
  );
}
