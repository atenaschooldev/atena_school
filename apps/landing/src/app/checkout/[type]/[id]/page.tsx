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
    <main className="min-h-screen lg:h-screen lg:overflow-hidden py-6 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-[#043569]/[0.02] to-[#F8861D]/[0.03] text-foreground flex items-center justify-center relative">
      {/* Subtle Ambient Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#043569]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F8861D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto space-y-5 relative z-10">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
          <div>
            <Link
              href={`/book/${type}/${id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#043569] transition-colors group cursor-pointer mb-0.5"
            >
              <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Torna alla selezione data e ora
            </Link>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#043569]">
              Dettagli e Pagamento
            </h1>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="w-full">
          <CheckoutStepper currentStep={2} />
        </div>

        {/* Login Nudge Banner — only for guests */}
        {!user && (
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-gradient-to-r from-[#043569]/8 to-[#F8861D]/8 border border-[#043569]/15 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#043569]/10 flex items-center justify-center shrink-0">
                <Lightning className="w-4 h-4 text-[#F8861D]" weight="fill" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Sei già un nostro cliente?{" "}
                <span className="text-[#043569] font-bold">Accedi</span>{" "}
                per compilare i dati in automatico e tenere traccia di tutte le tue prenotazioni.
              </p>
            </div>
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#043569] hover:bg-[#F8861D] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-md"
            >
              <SignIn className="w-3.5 h-3.5" />
              Accedi
            </Link>
          </div>
        )}

        {/* Form Wrap Surrounding Both Columns */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Personal Details (7 cols) */}
            <div className="md:col-span-12 lg:col-span-7 h-full">
              <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4.5 h-full flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#043569]/10 flex items-center justify-center text-[#043569] font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h2 className="font-bold text-[#043569] text-base">Dati personali</h2>
                      <p className="text-xs text-slate-400">Riceverai la conferma su questa email</p>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#043569]/5 border border-[#043569]/10 rounded-xl text-xs text-[#043569] font-semibold">
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.picture}
                          alt=""
                          className="w-5 h-5 rounded-full shrink-0 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full shrink-0 bg-[#F8861D] flex items-center justify-center text-white text-[9px] font-black">
                          {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Nome *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="Mario"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#043569] focus:bg-white transition-colors"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500 font-medium">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Cognome *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Rossi"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#043569] focus:bg-white transition-colors"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500 font-medium">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email *
                    </label>
                    <div className="relative">
                      <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="mario.rossi@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#043569] focus:bg-white transition-colors"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Telefono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+39 340 1234567"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#043569] focus:bg-white transition-colors"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1 flex-1 flex flex-col">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Note per il docente <span className="font-normal text-slate-400">(opzionale)</span>
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={6}
                    placeholder="Esempio: Livelloattuale, obiettivi o richieste particolari per il docente..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#043569] focus:bg-white transition-colors resize-none flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Action Buttons (5 cols) */}
            <div className="md:col-span-12 lg:col-span-5">
              <div className="bg-gradient-to-b from-[#043569] via-[#053d78] to-[#022347] text-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#043569]/30 relative overflow-hidden border border-[#043569] space-y-4">
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#F8861D]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                  <h3 className="font-black text-base uppercase tracking-wider">
                    Riepilogo & Pagamento
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider text-[#F8861D] whitespace-nowrap shrink-0">
                    Passo 2 di 3
                  </span>
                </div>

                {/* Item Info */}
                <div className="space-y-3 relative z-10">
                  <div className="flex gap-3 items-center p-2.5 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-9 h-9 rounded-xl bg-[#F8861D]/20 flex items-center justify-center shrink-0 text-[#F8861D]">
                      <Sparkle className="w-5 h-5" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold select-none">Corso / Servizio</p>
                      <p className="font-bold text-xs leading-tight text-white">{title}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  {dateParam && timeParam && (
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <CalendarIcon className="w-4 h-4 text-[#F8861D] shrink-0" />
                        <span>{format(new Date(dateParam), "EEEE d MMMM yyyy", { locale: dateLocale })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Clock className="w-4 h-4 text-[#F8861D] shrink-0" />
                        <span>Ore {timeParam}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Prezzo corso</span>
                      <span className="text-white font-bold">€{item?.price || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 font-medium">
                      <span>Commissioni</span>
                      <span className="text-emerald-400 font-bold">Gratis</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                      <span className="font-black text-white text-xs uppercase tracking-wider">Totale</span>
                      <span className="text-2xl font-black text-white">
                        €{item?.price || 0}
                      </span>
                    </div>
                  </div>

                  {/* Payment Buttons inside Sidebar */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    {/* 1. PAY ONLINE (Stripe) */}
                    <button
                      type="submit"
                      onClick={() => { actionRef.current = "pay"; }}
                      disabled={submitting !== false}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-[#635BFF] to-[#7B73FF] hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-between shadow-xl shadow-[#635BFF]/40 disabled:opacity-50 group cursor-pointer"
                    >
                      {submitting === "pay" ? (
                        <div className="w-full flex justify-center items-center gap-2 py-0.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span className="text-xs font-semibold">Reindirizzamento...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <CreditCard className="w-4 h-4 text-white" />
                            <span>Paga Ora</span>
                          </div>
                          <Lock className="w-3.5 h-3.5 text-white/70" />
                        </>
                      )}
                    </button>

                    {/* 2. BOOK NOW, PAY LATER */}
                    <button
                      type="submit"
                      onClick={() => { actionRef.current = "book"; }}
                      disabled={submitting !== false}
                      className="w-full py-3 px-5 bg-[#0f4a85] hover:bg-[#1a5a9a] text-white border border-white/10 rounded-2xl font-bold text-xs transition-all duration-300 flex items-center justify-between disabled:opacity-50 group cursor-pointer"
                    >
                      {submitting === "book" ? (
                        <div className="w-full flex justify-center items-center gap-2 py-0.5">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span className="text-xs font-semibold">Salvataggio...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5">
                            <BookmarkSimple className="w-4 h-4 text-[#F8861D]" weight="fill" />
                            <span>Prenota ora e paga in sede</span>
                          </div>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Guarantees */}
                  <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-white/70 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>100% Sicuro SSL</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Conferma Immediata</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
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
