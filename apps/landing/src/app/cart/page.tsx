"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { 
  ShoppingBag, 
  Trash, 
  Calendar, 
  Clock, 
  User, 
  CreditCard,
  ArrowRight,
  ShieldCheck
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getSessionId } from "@/lib/utils";
import { toast } from "sonner";

interface CartBooking {
  id: string;
  item_id: string;
  item_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
}

export default function CartPage() {
  const t = useTranslations("cart");
  const router = useRouter();
  const supabase = createClient();
  const dateLocale = it;

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchCart() {
      const { data: { user } } = await supabase.auth.getUser();
      const sid = getSessionId();

      // 1. Fetch bookings first
      let query = supabase
        .from("bookings")
        .select("*")
        .eq("status", "in_cart");

      if (user) {
        query = query.eq("user_id", user.id);
      } else if (sid) {
        query = query.eq("session_id", sid);
      } else {
        setLoading(false);
        return;
      }

      const { data: bookingsData, error: bookingsError } = await query;

      if (bookingsError) {
        console.error("Fetch bookings error:", bookingsError);
        setLoading(false);
        return;
      }

      if (bookingsData && bookingsData.length > 0) {
        // 2. Fetch details for each item manually to avoid invalid joins
        const formatted = await Promise.all(bookingsData.map(async (b) => {
          const table = b.item_type === 'course' ? 'courses' : 'shop_items';
          const { data: itemData } = await supabase
            .from(table)
            .select('*')
            .eq('id', b.item_id)
            .single();

          const title = itemData?.title_it || "Unknown";
          // Handle price: use numeric price_eur from either table
          const price = itemData?.price_eur || itemData?.price || "0";
          
          return {
            ...b,
            title,
            price: typeof price === 'number' ? `${price}€` : price,
            teacher: itemData?.teacher_name || "TBD"
          };
        }));
        setBookings(formatted);
      } else {
        setBookings([]);
      }
      setLoading(false);
    }
    fetchCart();
  }, [supabase]);

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Rimosso dal carrello");
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const sid = getSessionId();
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let query = supabase
      .from("bookings")
      .update({ status: "paid" })
      .eq("status", "in_cart");

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("session_id", sid);
    }

    const { error } = await query;

    if (!error) {
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Pagamento completato!");
      router.push("/dashboard"); 
    } else {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
              Il tuo Carrello
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {bookings.length} articoli pronti per il checkout
          </p>
        </header>

        {bookings.length === 0 ? (
          <div className="max-w-xl mx-auto mt-12">
            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-border shadow-sm">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 opacity-50 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium text-lg mb-8">
                Il tuo carrello è attualmente vuoto.
              </p>
              <Link 
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background font-bold rounded-2xl hover:bg-primary transition-all duration-300 group"
              >
                Esplora lo shop
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-6">
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-background rounded-3xl p-6 border border-border/50 shadow-sm flex flex-col md:flex-row gap-6 relative group"
                >
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-foreground">{booking.title}</h3>
                      <button 
                        onClick={() => removeItem(booking.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/5"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {format(new Date(booking.booking_date), "dd MMM yyyy", { locale: dateLocale })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {booking.booking_time.substring(0, 5)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                        <User className="w-4 h-4 text-primary" />
                        {booking.teacher}
                      </div>
                    </div>
                  </div>

                  <div className="md:border-l border-border md:pl-6 flex flex-col justify-center items-end min-w-[100px]">
                    <p className="text-2xl font-black text-primary">{booking.price}</p>
                  </div>
                </div>
              ))}
            </div>

          {/* Checkout Summary */}
          {bookings.length > 0 && (
            <div className="lg:col-span-5">
              <div className="sticky top-32 bg-foreground text-background rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-black uppercase mb-8 border-b border-background/10 pb-4">
                  Riepilogo Ordine
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm opacity-60">
                    <span>Subtotal</span>
                    <span>{bookings.length} items</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-4 border-t border-background/10">
                    <span className="uppercase tracking-tight">Total</span>
                    <span className="text-primary">
                      {bookings.reduce((acc, b) => acc + parseFloat(b.price.toString().replace('€', '')), 0)}€
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    disabled={processing}
                    onClick={handleCheckout}
                    className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Paga Ora (Stripe)
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest opacity-40 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Encrypted Payment Session
                  </div>
                </div>

                <div className="mt-8 p-4 bg-background/5 rounded-2xl border border-background/10">
                  <p className="text-[11px] leading-relaxed opacity-50 italic">
                    Nota: Questa è una simulazione. Cliccando su 'Paga Ora', il sistema confermerà le tue lezioni senza prelevare denaro reale.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
