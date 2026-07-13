"use client";

import { useState, useEffect, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, CreditCard, ChevronLeft, Mail, MessageSquare, Phone, ShieldCheck, User, UserCircle, ArrowRight } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSessionId } from "@/lib/utils";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Invalid phone"),
  additionalInfo: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface BookingItem {
  id: string;
  title_it: string;
  title_en: string;
  price: string | number;
  teacher_name: string;
}

function CheckoutContent({ params: { locale, type, id } }: { params: { locale: string; type: string; id: string } }) {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const dateLocale = locale === "it" ? it : enUS;

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
      const table = type === "course" ? "courses" : "shop_items";
      const { data: itemData } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();
      
      if (itemData) setItem(itemData);

      const { data: { user: userData } } = await supabase.auth.getUser();
      if (userData) {
        setUser(userData);
        const names = userData.user_metadata?.full_name?.split(" ") || ["", ""];
        setValue("firstName", names[0]);
        setValue("lastName", names.slice(1).join(" "));
        setValue("email", userData.email || "");
      }
      
      setLoading(false);
    }
    fetchData();
  }, [id, type, supabase, setValue]);

  const onSubmit = async (values: CheckoutFormValues, status: "in_cart" | "paid") => {
    if (!dateParam || !timeParam || !item) return;

    setSubmitting(true);

    if (status === "paid") {
      // 1. Stripe Payment Flow via Edge Function
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          itemId: item.id,
          itemType: type,
          customerEmail: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          date: dateParam,
          time: timeParam,
          slotId: slotIdParam,
          locale: locale,
        }
      });

      if (error) {
        console.error("Stripe Error:", error);
        setSubmitting(false);
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } else {
      // 2. Add to Cart (Standard logic)
      const sid = getSessionId();
      const { error } = await supabase.from("bookings").insert({
        user_id: user?.id || null, 
        session_id: user ? null : sid,
        item_id: item.id,
        item_type: type,
        slot_id: slotIdParam,
        booking_date: dateParam,
        booking_time: timeParam,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        additional_info: values.additionalInfo,
        status: "in_cart"
      });

      if (!error) {
        window.dispatchEvent(new Event("cartUpdated"));
        router.push("/cart");
      } else {
        console.error(error);
        setSubmitting(false);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!item || !dateParam || !timeParam) return (
    <div className="min-h-screen pt-32 text-center">
      <p className="text-muted-foreground mb-4">Missing booking information</p>
      <Link href="/shop" className="text-primary font-bold">Back to list</Link>
    </div>
  );

  const title = item[`title_${locale}` as keyof BookingItem] as string;
  const formattedDate = format(new Date(dateParam), "dd MMMM yyyy", { locale: dateLocale });

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {locale === "it" ? "Modifica data" : "Change date"}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <header>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">
                {locale === "it" ? "I tuoi dati" : "Your details"}
              </h1>
              {!user && (
                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <UserCircle className="w-5 h-5 text-primary" />
                  <p className="text-sm">
                    {locale === "it" ? "Hai già un account?" : "Already have an account?"}{" "}
                    <Link 
                      href={`/auth/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`} 
                      className="font-bold text-primary hover:underline"
                    >
                      {locale === "it" ? "Accedi" : "Login"}
                    </Link>
                  </p>
                </div>
              )}
            </header>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    {locale === "it" ? "Nome" : "First Name"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("firstName")}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="Esm. Mario"
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    {locale === "it" ? "Cognome" : "Last Name"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("lastName")}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="Esm. Rossi"
                    />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("email")}
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="mario.rossi@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                    {locale === "it" ? "Telefono" : "Phone"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("phone")}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      placeholder="+39 000 000 000"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">
                  {locale === "it" ? "Informazioni aggiuntive (opzionale)" : "Additional info (optional)"}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <textarea 
                    {...register("additionalInfo")}
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                    placeholder={locale === "it" ? "Scrivi qui eventuali note..." : "Any special requests..."}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-foreground text-background rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h2 className="text-2xl font-black uppercase mb-8 relative z-10 border-b border-background/10 pb-4">
                  {locale === "it" ? "Riepilogo" : "Summary"}
                </h2>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Service</p>
                      <p className="font-bold text-lg leading-tight">{title}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Date & Time</p>
                      <p className="font-bold">{formattedDate} ore {timeParam}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Teacher</p>
                      <p className="font-bold">{item.teacher_name}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-background/10">
                    <div className="flex justify-between items-center text-2xl">
                      <span className="font-black uppercase tracking-tight">Total</span>
                      <span className="font-black text-primary">{item.price}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      disabled={submitting}
                      onClick={handleSubmit((vals) => onSubmit(vals, "in_cart"))}
                      className="w-full py-4 bg-background border-2 border-primary text-primary rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/5 transition-all disabled:opacity-50"
                    >
                      {submitting ? "..." : (locale === "it" ? "Aggiungi al Carrello" : "Add to Cart")}
                    </button>

                    <button
                      disabled={submitting}
                      onClick={handleSubmit((vals) => onSubmit(vals, "paid"))}
                      className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {submitting ? "..." : (locale === "it" ? "Paga e Finalizza" : "Pay & Finalize")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  {locale === "it" ? "Pagamento sicuro con Stripe" : "Secure payment with Stripe"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="w-4 h-4 opacity-50" />
                  {locale === "it" ? "Cancellazione gratuita fino a 24h prima" : "Free cancellation up to 24h before"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage(props: { params: { locale: string; type: string; id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CheckoutContent {...props} />
    </Suspense>
  );
}
