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
  ShieldCheck,
  Sparkle,
  SignIn,
  Lightning,
  Headset,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  MapPin,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";

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
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
      </div>
    );
  }

  const title = item?.name || item?.title_it || "Lezione / Corso Atena";

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Top nav bar */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href={`/book/${type}/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#043569] transition-all group"
          >
            <CaretLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Torna alla selezione data e ora
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-2.5 2xl:py-5 flex flex-col gap-2.5 2xl:gap-4">

          {/* Page header */}
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-black tracking-tight text-[#043569] leading-tight">
              Dettagli e pagamento
            </h1>
            <p className="text-xs 2xl:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Inserisci i tuoi dati personali per completare la prenotazione.
            </p>
          </div>

          {/* Stepper */}
          <div>
            <CheckoutStepper currentStep={2} />
          </div>

          {/* Two-column layout */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-5 2xl:gap-6 items-stretch"
          >
            {/* LEFT: Form */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl 2xl:rounded-3xl shadow-[0_2px_24px_rgba(4,53,105,0.06)] overflow-hidden flex flex-col h-full">

              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-slate-100/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-lg bg-gradient-to-br from-[#F8861D] to-[#e07516] text-white text-[10px] 2xl:text-xs flex items-center justify-center font-black shadow-sm">
                    1
                  </span>
                  <span className="text-xs 2xl:text-sm font-bold text-[#043569] tracking-wide">
                    Dati personali
                  </span>
                </div>

                {user && (
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-xl">
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
                    <span className="text-[11px] font-semibold text-slate-600">{user.email}</span>
                  </div>
                )}
              </div>

              <div className="p-3 2xl:p-4 space-y-2.5 2xl:space-y-3 flex flex-col flex-1">
                {/* Login nudge for guests */}
                {!user && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-[#F8861D] shrink-0">
                        <Lightning className="w-3.5 h-3.5" weight="fill" />
                      </div>
                      <p className="text-xs text-slate-700">
                        Sei già cliente?{" "}
                        <span className="font-bold text-[#043569]">Accedi</span> per autocompilare.
                      </p>
                    </div>
                    <Link
                      href={`/auth/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "")}`}
                      className="shrink-0 px-3 py-1.5 bg-[#043569] hover:bg-[#F8861D] text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <SignIn className="w-3 h-3" />
                      <span>Accedi</span>
                    </Link>
                  </div>
                )}

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 2xl:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Nome *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="Mario"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Cognome *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Rossi"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email & Phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 2xl:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Email *
                    </label>
                    <div className="relative group">
                      <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="mario.rossi@email.com"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Telefono *
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+39 340 1234567"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Parent / Child toggle */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      {...register("isForChild")}
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#043569] focus:ring-[#043569]"
                    />
                    <span className="text-xs font-bold text-[#043569]">
                      Acquisto questo corso per mio figlio/a
                    </span>
                  </label>

                  {formMethods.watch("isForChild") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Nome studente *
                        </label>
                        <input
                          {...register("studentFirstName")}
                          type="text"
                          placeholder="Nome del figlio/a"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#043569]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Cognome studente *
                        </label>
                        <input
                          {...register("studentLastName")}
                          type="text"
                          placeholder="Cognome del figlio/a"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#043569]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Student Birth Date & Tax Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 2xl:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Data di nascita studente <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                    </label>
                    <div className="relative group">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("studentBirthDate")}
                        type="date"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Codice Fiscale / P.IVA <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                    </label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("taxCode")}
                        type="text"
                        placeholder="RSSMRA80A01H501U"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Fee Option */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      {...register("includeRegistrationFee")}
                      type="checkbox"
                      className="w-4 h-4 rounded border-amber-300 text-[#043569] focus:ring-[#043569] mt-0.5"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-amber-950">
                        Include Quota d'iscrizione annuale (30,00 €)
                      </span>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        Quota obbligatoria valevole per l'Anno Accademico 2026/2027 (deseleziona solo se già versata).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 flex flex-col flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                    Note per il docente{" "}
                    <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                  </label>
                  <textarea
                    {...register("notes")}
                    placeholder="Esempio: Livello attuale, obiettivi o richieste particolari..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all resize-none flex-1 min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Dark sidebar */}
            <div className="lg:sticky lg:top-6 flex flex-col h-full">
              <div className="bg-[#062d5e] rounded-2xl 2xl:rounded-3xl overflow-hidden shadow-2xl shadow-[#043569]/20 flex flex-col h-full">

                {/* Sidebar header */}
                <div className="px-4 2xl:px-5 pt-3.5 2xl:pt-4 pb-2.5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs 2xl:text-sm font-bold text-white">Riepilogo prenotazione</h2>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-white/8 px-2 py-0.5 rounded-full">
                      Passo 2 di 3
                    </span>
                  </div>
                </div>

                {/* Course info */}
                <div className="px-4 2xl:px-5 py-2.5 2xl:py-3 space-y-2 2xl:space-y-2.5">
                  {[
                    { icon: <GraduationCap className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "SERVIZIO", value: title },
                    { icon: <User className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "DOCENTE", value: item?.teacher_name || "Staff Atena" },
                    { icon: <MapPin className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />, label: "SEDE", value: "Atena School, Via Matteotti 11" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 2xl:w-9 2xl:h-9 rounded-xl bg-white/8 flex items-center justify-center shrink-0 text-white/70 mt-0.5">
                        {row.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] 2xl:text-[10px] font-black uppercase tracking-widest text-white/35 select-none">
                          {row.label}
                        </p>
                        <p className="text-xs 2xl:text-sm font-bold text-white leading-snug mt-0.5 break-words">
                          {row.value}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Date & Time */}
                  {dateParam && dateParam !== "da_concordare" && timeParam && timeParam !== "da_concordare" ? (
                    <div className="space-y-2 pt-2.5 border-t border-white/10">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-white/50">
                          <CalendarIcon className="w-3.5 h-3.5 text-white/40" />
                          <span>Prima lezione</span>
                        </div>
                        <span className="font-bold text-white text-right">
                          {format(new Date(dateParam), "d MMMM yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-white/50">
                          <Clock className="w-3.5 h-3.5 text-white/40" />
                          <span>Orario</span>
                        </div>
                        <span className="font-bold text-white text-right">{timeParam}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2.5 border-t border-white/10">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-white/50">
                          <CalendarIcon className="w-3.5 h-3.5 text-white/40" />
                          <span>Programmazione</span>
                        </div>
                        <span className="font-bold text-emerald-400 text-right">
                          Da concordare con la scuola
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="space-y-1.5 pt-2.5 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Prezzo corso</span>
                      <span className="font-bold text-white">€{Number(item?.price || 0).toFixed(2)}</span>
                    </div>
                    {formMethods.watch("includeRegistrationFee") !== false && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Quota iscrizione annuale</span>
                        <span className="font-bold text-amber-400">€{ANNUAL_REGISTRATION_FEE_EUR.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Commissioni</span>
                      <span className="font-bold text-emerald-400">Gratis</span>
                    </div>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="px-4 2xl:px-5 py-2.5 2xl:py-3 space-y-2 2xl:space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 select-none">
                      Totale
                    </span>
                    <div className="text-right">
                      <span className="text-xl 2xl:text-2xl font-black text-white">
                        {(
                          Number(item?.price || 0) +
                          (formMethods.watch("includeRegistrationFee") !== false ? ANNUAL_REGISTRATION_FEE_EUR : 0)
                        ).toFixed(2)}{" "}
                        €
                      </span>
                    </div>
                  </div>

                  {/* Pay online (Stripe) */}
                  <button
                    type="submit"
                    onClick={() => { actionRef.current = "pay"; }}
                    disabled={submitting !== false}
                    className="Btn"
                  >
                    {submitting === "pay" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Reindirizzamento...</span>
                      </>
                    ) : (
                      <>
                        <span>Paga ora con Carta</span>
                        <svg className="svgIcon" viewBox="0 0 576 512">
                          <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"></path>
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Book now pay later */}
                  <button
                    type="submit"
                    onClick={() => { actionRef.current = "book"; }}
                    disabled={submitting !== false}
                    className="Btn-orange"
                  >
                    {submitting === "book" ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-700" />
                        <span>Salvataggio...</span>
                      </>
                    ) : (
                      <>
                        <span>Prenota ora e paga in sede</span>
                        <svg className="svgIcon" viewBox="0 0 512 512">
                          <path d="M464 128H400V80c0-26.5-21.5-48-48-48H160c-26.5 0-48 21.5-48 48v48H48c-26.5 0-48 21.5-48 48v256c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V176c0-26.5-21.5-48-48-48zM160 80h192v48H160V80zm304 352H48V176h416v256z"></path>
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-white/12 text-center select-none">
                    {[
                      { icon: <ShieldCheck className="w-4 h-4 text-white/70" />, label: "Pagamento sicuro", sub: "SSL 256-bit" },
                      { icon: <CheckCircle className="w-4 h-4 text-white/70" />, label: "Conferma", sub: "Immediata" },
                      { icon: <Headset className="w-4 h-4 text-white/70" />, label: "Supporto", sub: "Sempre attivo" },
                    ].map((badge) => (
                      <div key={badge.label} className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                        <span>{badge.icon}</span>
                        <span className="text-[10px] text-white/90 leading-snug font-bold">{badge.label}</span>
                        <span className="text-[9px] text-white/60 leading-tight">{badge.sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
      </div>
    }>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
