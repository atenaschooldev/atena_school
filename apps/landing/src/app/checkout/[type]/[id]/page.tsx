"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { 
  CaretLeft, 
  User, 
  Envelope, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard,
  Lock,
  UserCircle
} from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getSessionId } from "@/lib/utils";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  phone: z.string().min(6, "Inserisci un numero di telefono valido"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface BookingItem {
  id: string;
  title_it: string;
  title_en: string;
  price: string | number;
  teacher_name: string;
}

function CheckoutContent({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = use(params);
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const dateLocale = it;

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch item
      const table = type === "course" ? "courses" : "shop_items";
      const { data: itemData } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (itemData) {
        setItem(itemData);
      }

      // 2. Fetch logged-in user to autofill details
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setValue("email", user.email || "");
        
        // Split full name if available
        const fullName = user.user_metadata?.full_name || "";
        if (fullName) {
          const parts = fullName.split(" ");
          setValue("firstName", parts[0] || "");
          setValue("lastName", parts.slice(1).join(" ") || "");
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [id, type, setValue, supabase]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!dateParam || !timeParam || !item) {
      toast.error("Missing booking date or time selection");
      return;
    }

    setSubmitting(true);

    try {
      const sid = getSessionId();

      const bookingPayload: any = {
        item_id: id,
        item_type: type,
        user_id: user?.id || null,
        session_id: user ? null : sid,
        booking_date: dateParam,
        booking_time: timeParam,
        slot_id: slotIdParam || null,
        status: "paid", // Auto-paying in simulation
        student_name: `${values.firstName} ${values.lastName}`,
        student_email: values.email,
        student_phone: values.phone,
        notes: values.notes || "",
        locale: 'it',
      };

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert([bookingPayload])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // If slot was selected, mark it as booked
      if (slotIdParam) {
        const { error: slotError } = await supabase
          .from("schedule_slots")
          .update({ is_booked: true })
          .eq("id", slotIdParam);

        if (slotError) {
          console.error("Failed to mark slot as booked:", slotError);
        }
      }

      toast.success("Pagamento completato!");
      router.push("/checkout/success");
    } catch (err: any) {
      toast.error(err.message || "Qualcosa è andato storto");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!item || !dateParam || !timeParam) return (
    <div className="min-h-screen pt-32 text-center">
      <p className="text-muted-foreground mb-4">Informazioni di prenotazione mancanti</p>
      <Link href="/shop" className="text-primary font-bold">Torna alla lista</Link>
    </div>
  );

  const title = item.title_it;
  const formattedDate = format(new Date(dateParam), "dd MMMM yyyy", { locale: dateLocale });

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Modifica data
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <header>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
                I tuoi dati
              </h1>
              {!user && (
                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <p className="text-sm">
                    Hai già un account?{" "}
                    <Link 
                      href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} 
                      className="font-bold text-primary hover:underline"
                    >
                      Accedi
                    </Link>
                  </p>
                </div>
              )}
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-3xl border border-border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("firstName")}
                      className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Mario"
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Cognome
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("lastName")}
                      className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Rossi"
                    />
                  </div>
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Email
                  </label>
                  <div className="relative">
                    <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("email")}
                      type="email"
                      className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="mario.rossi@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Telefono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("phone")}
                      className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="+39 333 1234567"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Informazioni aggiuntive (opzionale)
                </label>
                <textarea 
                  {...register("notes")}
                  rows={4}
                  className="w-full bg-background border border-border rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Scrivi qui eventuali note..."
                />
              </div>

              <button type="submit" className="hidden" id="submit-checkout-btn" />
            </form>
          </div>

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
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Service</p>
                      <p className="font-bold text-lg leading-tight">{title}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Date & Time</p>
                      <p className="font-bold">{formattedDate}</p>
                      <p className="text-sm opacity-70">ore {timeParam}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-background/10 space-y-4">
                    <div className="flex justify-between items-center text-2xl pt-4">
                      <span className="font-black uppercase tracking-tight">Total</span>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 opacity-50" />
                        <span className="font-black text-primary">{Number(item.price).toFixed(0)}€</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => document.getElementById("submit-checkout-btn")?.click()}
                      disabled={submitting}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-secondary hover:text-secondary-foreground transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                    >
                      {submitting ? "..." : "Paga e Finalizza"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4">
                <div className="flex items-center gap-3 text-muted-foreground opacity-60 text-xs font-bold uppercase tracking-widest">
                  <Lock className="w-4 h-4" />
                  Pagamento sicuro con Stripe
                </div>
                <div className="flex items-center gap-3 text-muted-foreground opacity-60 text-xs font-bold uppercase tracking-widest">
                  <CalendarIcon className="w-4 h-4" />
                  Cancellazione gratuita fino a 24h prima
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage(props: { params: Promise<{ type: string; id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CheckoutContent params={props.params} />
    </Suspense>
  );
}
