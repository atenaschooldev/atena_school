"use client";

import { use, Suspense } from "react";
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
  ShieldCheck,
  Sparkle,
  SignIn,
  Lightning,
  Headset,
  ArrowRight,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";

function CheckoutContent({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = use(params);
  const dateLocale = it;

  const {
    item,
    loading,
    submitting,
    user,
    dateParam,
    timeParam,
    actionRef,
    formMethods,
    onSubmit,
  } = useCheckout(type, id);

  const { register, handleSubmit, formState: { errors } } = formMethods;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#043569]" />
      </div>
    );
  }

  const title = item?.name || item?.title_it || "Lezione / Corso Atena";

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
              href={`/book/${type}/${id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#043569] transition-colors group cursor-pointer mb-0.5"
            >
              <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Torna alla selezione data e ora
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#043569]">
              Dettagli e pagamento
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Inserisci i tuoi dati personali per completare la prenotazione.
            </p>
          </div>

          <div className="shrink-0">
            <CheckoutStepper currentStep={2} />
          </div>
        </div>
      </header>

      {/* Main Centered Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center items-center space-y-3.5 my-auto relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Main Unified Card Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
            
            {/* Left Column: Personal Details Form (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs tracking-wider text-[#043569] select-none">
                    <span className="w-5 h-5 rounded-lg bg-orange-100 text-[#F8861D] text-xs flex items-center justify-center font-bold">1</span>
                    <span>Dati personali</span>
                  </div>

                  {user && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.picture}
                          alt=""
                          className="w-4 h-4 rounded-full shrink-0 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full shrink-0 bg-[#043569] flex items-center justify-center text-white text-[8px] font-bold">
                          {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-[11px] font-semibold">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Login Nudge Banner for Guests */}
                {!user && (
                  <div className="bg-orange-50/60 border border-orange-100/80 rounded-2xl p-3 flex items-center justify-between gap-3 select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#F8861D] shrink-0">
                        <Lightning className="w-3.5 h-3.5" weight="fill" />
                      </div>
                      <p className="text-xs text-slate-700">
                        Sei già cliente? <span className="font-bold text-[#043569]">Accedi</span> per autocompilare.
                      </p>
                    </div>
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`}
                      className="shrink-0 px-3 py-1.5 bg-[#043569] hover:bg-[#F8861D] text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1"
                    >
                      <SignIn className="w-3 h-3" />
                      <span>Accedi</span>
                    </Link>
                  </div>
                )}

                {/* Form Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                      Nome *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="Mario"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/15 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all duration-200"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                      Cognome *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Rossi"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/15 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all duration-200"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                      Email *
                    </label>
                    <div className="relative group">
                      <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="mario.rossi@email.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/15 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all duration-200"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                      Telefono *
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+39 340 1234567"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/15 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all duration-200"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Notes for Teacher */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 select-none">
                    Note per il docente <span className="font-normal text-slate-400">(opzionale)</span>
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Esempio: Livello attuale, obiettivi o richieste particolari..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/15 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Action Buttons (5 cols) */}
            <div className="lg:col-span-5 bg-[#092543] text-white p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3 select-none">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Riepilogo prenotazione
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium tracking-wider text-white/80">
                    Passo 2 di 3
                  </span>
                </div>

                {/* Service Details with Icon Boxes */}
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-center group">
                    <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 text-white transition-colors">
                      <Sparkle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold select-none">SERVIZIO</p>
                      <p className="font-bold text-xs text-white leading-snug">{title}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-center group">
                    <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 text-white transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold select-none">DOCENTE</p>
                      <p className="font-bold text-xs text-white">{item?.teacher_name || "Elisabetta Sorrenti"}</p>
                    </div>
                  </div>

                  {/* Selected Date & Time Rows */}
                  {dateParam && timeParam && (
                    <div className="pt-2.5 border-t border-white/15 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-white/70 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-white/70" />
                          <span>Data scelta</span>
                        </div>
                        <span className="font-bold text-white">
                          {format(new Date(dateParam), "d MMMM yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-white/70 font-medium">
                          <Clock className="w-3.5 h-3.5 text-white/70" />
                          <span>Orario scelto</span>
                        </div>
                        <span className="font-bold text-white">{timeParam}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="pt-2.5 border-t border-white/15 space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Prezzo corso</span>
                      <span className="text-white font-bold">€{Number(item?.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Commissioni</span>
                      <span className="text-emerald-400 font-bold">Gratis</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/15">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-xs text-white/70 select-none">TOTALE</span>
                  <span className="font-extrabold text-white text-2xl">€{Number(item?.price || 0).toFixed(2)}</span>
                </div>

                {/* Payment Action Buttons */}
                <div className="space-y-2.5">
                  {/* 1. PAY ONLINE (Stripe) */}
                  <button
                    type="submit"
                    onClick={() => { actionRef.current = "pay"; }}
                    disabled={submitting !== false}
                    className="w-full py-3.5 px-5 bg-[#F8861D] hover:bg-[#e07516] active:scale-[0.99] text-white rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting === "pay" ? (
                      <div className="w-full flex justify-center items-center gap-2 py-0.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span className="text-xs font-semibold">Reindirizzamento...</span>
                      </div>
                    ) : (
                      <span>Paga ora con Carta</span>
                    )}
                  </button>

                  {/* 2. BOOK NOW, PAY LATER — Solid White Non-transparent Button */}
                  <button
                    type="submit"
                    onClick={() => { actionRef.current = "book"; }}
                    disabled={submitting !== false}
                    className="w-full py-3 px-5 bg-white hover:bg-slate-100 active:scale-[0.99] text-[#043569] rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting === "book" ? (
                      <div className="w-full flex justify-center items-center gap-2 py-0.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#043569]" />
                        <span className="text-xs font-semibold">Salvataggio...</span>
                      </div>
                    ) : (
                      <span>Prenota ora e paga in sede</span>
                    )}
                  </button>
                </div>

                {/* Bottom Trust Badges inside Sidebar */}
                <div className="pt-2.5 border-t border-white/10 grid grid-cols-3 gap-1.5 text-[9px] text-white/60 text-center select-none">
                  <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span className="leading-tight">Pagamento sicuro<br />SSL 256-bit</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span className="leading-tight">Conferma<br />Immediata</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 p-1 rounded-lg hover:bg-white/5 transition-colors">
                    <Headset className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span className="leading-tight">Supporto dedicato<br />Siamo qui per te</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Feature Trust Bar below Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs text-slate-600 select-none w-full">
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Pagamenti crittografati</p>
              <p className="text-[10px] text-slate-400">Protezione Stripe SSL</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <Sparkle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Metodologia efficace</p>
              <p className="text-[10px] text-slate-400">Risultati garantiti</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Cancellazione 24h</p>
              <p className="text-[10px] text-slate-400">Massima flessibilità</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#043569] shrink-0">
              <Headset className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[11px]">Assistenza clienti</p>
              <p className="text-[10px] text-slate-400">Supporto via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#043569]" />
      </div>
    }>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
