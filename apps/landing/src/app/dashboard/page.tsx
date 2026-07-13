"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Calendar, Clock, CheckCircle } from "@phosphor-icons/react";
import { format, isFuture, parseISO } from "date-fns";
import { it } from "date-fns/locale";

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
        .in("status", ["paid", "completed"])
        .order("created_at", { ascending: false });

      const userBookings: any[] = data || [];

      if (userBookings.length === 0) {
        setLoading(false);
        return;
      }

      // 3. Extract unique relational IDs
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // Statistics Calculation
  const uniqueCourses = new Set(bookings.map(b => b.item_id)).size;
  const upcomingLessons = bookings.filter(b => b.is_future).length;
  const totalHours = bookings.length; // Approximate 1 hr per booking

  return (
    <main className="min-h-screen pt-[calc(8rem+env(safe-area-inset-top))] pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
            Il tuo Pannello
          </h1>
          <p className="text-muted-foreground">
            Bentornato, {user?.user_metadata?.full_name?.split(" ")[0] || 'Studente'}!
          </p>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest mb-1">
                Corsi Attivi
              </p>
              <p className="text-4xl font-black">{uniqueCourses}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest mb-1">
                Prossime Lezioni
              </p>
              <p className="text-4xl font-black text-primary">{upcomingLessons}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest mb-1">
                Ore Totali
              </p>
              <p className="text-4xl font-black">{totalHours}</p>
            </div>
          </div>
        </div>

        {/* List of Bookings */}
        <section className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border flex justify-between items-end">
            <h2 className="text-2xl font-black uppercase">
              I tuoi appuntamenti
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-bold mb-2">
                Nessun appuntamento attivo
              </p>
              <p className="text-sm opacity-70">
                Non hai ancora completato nessun acquisto.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {bookings.map((booking) => {
                const dateDisplay = booking.slot_starts_at 
                  ? format(parseISO(booking.slot_starts_at), "dd MMMM yyyy", { locale: dateLocale })
                  : (booking.booking_date ? format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: dateLocale }) : "---");
                  
                const timeDisplay = booking.slot_starts_at
                  ? format(parseISO(booking.slot_starts_at), "HH:mm")
                  : booking.booking_time || "---";

                return (
                  <div key={booking.id} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-8 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 space-y-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${booking.is_future ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {booking.is_future ? "In Arrivo" : "Completato"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{booking.item_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        con <span className="font-bold">{booking.teacher_name}</span>
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-1">
                      <div className="text-left md:text-right">
                        <p className="font-black text-lg">{dateDisplay}</p>
                        <p className="text-muted-foreground">ore {timeDisplay}</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 bg-green-500/10 px-3 py-1 mt-2 rounded-full text-xs font-bold uppercase tracking-widest self-start md:self-auto">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Pagato
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
