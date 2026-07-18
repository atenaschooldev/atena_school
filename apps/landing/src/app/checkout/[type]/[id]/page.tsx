"use client";

import { useState, useEffect, use, Suspense, useRef } from "react";
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
  UserCircle,
  BookmarkSimple,
  CheckCircle,
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

// Track which action (book / pay) triggered the form submit
type SubmitAction = "book" | "pay";

function CheckoutContent({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const dateLocale = it;

  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");
  const slotIdParam = searchParams.get("slot_id");

  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<false | "book" | "pay">(false);
  const [user, setUser] = useState<any>(null);
  const actionRef = useRef<SubmitAction>("book");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    async function fetchData() {
      const table = type === "course" ? "courses" : "shop_items";
      const { data: itemData } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (itemData) setItem(itemData);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setValue("email", user.email || "");
        const userPhone = user.user_metadata?.phone || user.phone || "";
        if (userPhone) {
          setValue("phone", userPhone);
        }
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

  // ── BOOK: save with status "reserved", go to success?type=booking ──────────
  const handleBook = async (values: CheckoutFormValues) => {
    if (!dateParam || !timeParam || !item) {
      toast.error("Informazioni di prenotazione mancanti");
      return;
    }

    setSubmitting("book");
    try {
      const sid = getSessionId();

      // Save phone to user metadata if logged in and it changed
      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await supabase.auth.updateUser({
            data: { phone: values.phone }
          });
        }
      }

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert([{
          item_id: id,
          item_type: type,
          user_id: user?.id || null,
          session_id: user ? null : sid,
          booking_date: dateParam,
          booking_time: timeParam,
          slot_id: slotIdParam || null,
          status: "reserved",
          student_name: `${values.firstName} ${values.lastName}`,
          student_email: values.email,
          student_phone: values.phone,
          notes: values.notes || "",
          locale: "it",
        }]);

      if (bookingError) throw bookingError;

      router.push("/checkout/success?type=booking");
    } catch (err: any) {
      toast.error(err.message || "Qualcosa è andato storto");
    } finally {
      setSubmitting(false);
    }
  };

  // ── PAY: call Stripe Edge Function → redirect to Stripe Checkout ────────────
  const handlePay = async (values: CheckoutFormValues) => {
    if (!dateParam || !timeParam || !item) {
      toast.error("Informazioni di prenotazione mancanti");
      return;
    }

    setSubmitting("pay");
    try {
      // Save phone to user metadata if logged in and it changed
      if (user && values.phone) {
        const existingPhone = user.user_metadata?.phone || user.phone || "";
        if (existingPhone !== values.phone) {
          await supabase.auth.updateUser({
            data: { phone: values.phone }
          });
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session?.access_token
        ? `Bearer ${session.access_token}`
        : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            itemId: id,
            itemType: type,
            customerEmail: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            date: dateParam,
            time: timeParam,
            slotId: slotIdParam || null,
            locale: "it",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore durante il pagamento");

      // Redirect to Stripe-hosted checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Qualcosa è andato storto");
      setSubmitting(false);
    }
  };

  // Single form onSubmit dispatcher
  const onSubmit = (values: CheckoutFormValues) => {
    if (actionRef.current === "pay") {
      handlePay(values);
    } else {
      handleBook(values);
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
      <Link href="/courses" className="text-primary font-bold">Torna ai corsi</Link>
    </div>
  );

  const title = item.title_it || (item as any).name || "";
  const formattedDate = format(new Date(dateParam), "dd MMMM yyyy", { locale: dateLocale });

  return (
    <main className="min-h-screen pt-8 md:pt-16 pb-16 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Modifica data
        </button>

        {/* Page Header */}
        <header className="mb-10 text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground mb-3">
            I tuoi dati
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Completa la prenotazione inserendo i tuoi dettagli qui sotto.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ── Form ── */}
          <div className="lg:col-span-8 space-y-6">
            {!user && (
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <UserCircle className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground/80">
                  Hai già un account?{" "}
                  <Link 
                    href={`/auth/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`} 
                    className="font-bold text-primary hover:underline"
                  >
                    Accedi
                  </Link>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
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

              {/* Hidden submit button — triggered programmatically by the sidebar buttons */}
              <button type="submit" className="hidden" id="submit-checkout-btn" />
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 w-full">
            <div className="sticky top-28 space-y-6 w-full">
              <div className="bg-foreground text-background rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden max-w-md mx-auto lg:max-w-none w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h2 className="text-xl sm:text-2xl font-black uppercase mb-6 relative z-10 border-b border-background/10 pb-3">
                  Riepilogo
                </h2>

                <div className="space-y-5 relative z-10">
                  {/* Service */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6 text-[#F8861D]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Servizio</p>
                      <p className="font-bold text-lg leading-tight">{title}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-[#F8861D]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Data e Orario</p>
                      <p className="font-bold">{formattedDate}</p>
                      <p className="text-sm opacity-70">ore {timeParam}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-5 border-t border-background/10">
                    <div className="flex justify-between items-center text-2xl">
                      <span className="font-black uppercase tracking-tight">Totale</span>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 opacity-70 text-secondary" />
                        <span className="font-black text-secondary">{Number(item.price).toFixed(0)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="flex flex-col gap-3 pt-2">
                    {/* PRENOTA (reserve, no payment) */}
                    <button
                      type="button"
                      disabled={submitting !== false}
                      onClick={() => {
                        actionRef.current = "book";
                        document.getElementById("submit-checkout-btn")?.click();
                      }}
                      className="w-full py-5 bg-transparent border-2 border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:text-[#043569] hover:border-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting === "book" ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                      ) : (
                        <>
                          <BookmarkSimple className="w-5 h-5" weight="bold" />
                          Prenota
                        </>
                      )}
                    </button>

                    {/* PAGA CON STRIPE */}
                    <button
                      type="button"
                      disabled={submitting !== false}
                      onClick={() => {
                        actionRef.current = "pay";
                        document.getElementById("submit-checkout-btn")?.click();
                      }}
                      className="w-full py-5 bg-[#F8861D] text-white border-2 border-transparent hover:bg-white hover:text-[#F8861D] hover:border-[#F8861D] rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 shadow-xl shadow-[#F8861D]/20 hover:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting === "pay" ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" weight="bold" />
                          Paga con Stripe
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security badges at bottom */}
              <div className="space-y-4 px-4 max-w-md mx-auto lg:max-w-none w-full">
                <div className="flex items-center gap-3 text-muted-foreground opacity-60 text-xs font-bold uppercase tracking-widest w-full">
                  <Lock className="w-4 h-4 text-[#F8861D]" />
                  Pagamento sicuro con Stripe
                </div>
                <div className="flex items-center gap-3 text-muted-foreground opacity-60 text-xs font-bold uppercase tracking-widest w-full">
                  <CalendarIcon className="w-4 h-4 text-[#F8861D]" />
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
