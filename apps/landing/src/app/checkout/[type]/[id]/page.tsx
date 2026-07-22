"use client";

import React, { Suspense, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import {
  User,
  Envelope,
  Phone,
  Calendar as CalendarIcon,
  ShieldCheck,
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle,
  Headset,
  Lightning,
  SignIn,
  CreditCard,
  Storefront,
  Spinner,
} from "@phosphor-icons/react";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";

function CheckoutContent({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = use(params);
  const {
    formMethods,
    item,
    loading,
    submitting,
    feeCheckStatus,
    user,
    dateParam,
    timeParam,
    actionRef,
    onSubmit,
  } = useCheckout(type, id);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;
  const includeRegistrationFee = watch("includeRegistrationFee");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
      </div>
    );
  }

  const coursePrice = Number(item?.price || 0);
  const isFeeAddedToOnlineTotal = feeCheckStatus === "not_paid" && includeRegistrationFee !== false;
  const totalPrice = coursePrice + (isFeeAddedToOnlineTotal ? ANNUAL_REGISTRATION_FEE_EUR : 0);
  const title = item?.title_it || item?.name || "Lezione / Corso Atena";

  return (
    <main className="min-h-screen bg-slate-50/60 pt-20 pb-16 2xl:pt-24 2xl:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* TOP BREADCRUMB STEPS */}
        <div className="max-w-3xl mx-auto mb-6 2xl:mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />

            <div className="flex flex-col items-center gap-1 bg-slate-50 px-2">
              <div className="w-8 h-8 rounded-full bg-[#043569] text-white flex items-center justify-center text-xs font-bold shadow-md">
                <CheckCircle className="w-4 h-4" weight="fill" />
              </div>
              <span className="text-[10px] 2xl:text-xs font-bold text-[#043569]">Data e Orario</span>
            </div>

            <div className="flex flex-col items-center gap-1 bg-slate-50 px-2">
              <div className="w-8 h-8 rounded-full bg-[#F8861D] text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-[#F8861D]/15">
                <CreditCard className="w-4 h-4" weight="bold" />
              </div>
              <span className="text-[10px] 2xl:text-xs font-bold text-[#043569]">Dati e Pagamento</span>
            </div>

            <div className="flex flex-col items-center gap-1 bg-slate-50 px-2 opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-[10px] 2xl:text-xs font-bold text-slate-400">Conferma</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-start">

          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-start">

            {/* LEFT FORM (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl 2xl:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">

              {/* Section header */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-slate-100">
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

              <div className="p-4 2xl:p-5 space-y-3.5 2xl:space-y-4 flex flex-col flex-1">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                        Email *
                      </label>
                      {feeCheckStatus === "checking" && (
                        <span className="text-[10px] text-[#043569] flex items-center gap-1 font-semibold animate-pulse">
                          <Spinner className="w-3 h-3 animate-spin text-[#F8861D]" /> Verifico...
                        </span>
                      )}
                    </div>
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

                {watch("isForChild") && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      Codice Fiscale genitore / acquirente * <span className="font-normal text-slate-400 normal-case">(per fattura)</span>
                    </label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#043569] transition-colors" />
                      <input
                        {...register("purchaserTaxCode")}
                        type="text"
                        placeholder="PRTMRA80A01H501U"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all uppercase"
                      />
                    </div>
                    {errors.purchaserTaxCode && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.purchaserTaxCode.message}</p>
                    )}
                  </div>
                )}

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

                  {watch("isForChild") && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Email studente <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                          </label>
                          <input
                            {...register("studentEmail")}
                            type="email"
                            placeholder="email.studente@esempio.it"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#043569]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Telefono studente <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                          </label>
                          <input
                            {...register("studentPhone")}
                            type="tel"
                            placeholder="+39 333 1234567"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#043569]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Student Birth Date & Tax Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      {watch("isForChild") ? "Codice Fiscale studente *" : "Codice Fiscale / P.IVA *"}
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
                    {errors.taxCode && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.taxCode.message}</p>
                    )}
                  </div>
                </div>

                {/* PREMIUM SAAS REGISTRATION FEE PAYMENT METHOD BOX */}
                {feeCheckStatus === "paid" && (
                  <div key="fee-paid-badge" className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-950 font-semibold select-none shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle className="w-5 h-5" weight="fill" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950 text-xs">Quota d'iscrizione annuale 2026/2027 già attiva</p>
                      <p className="text-[11px] text-emerald-800 font-normal mt-0.5">Nessun costo aggiuntivo applicato (€0,00)</p>
                    </div>
                  </div>
                )}

                {feeCheckStatus === "not_paid" && (
                  <div key="fee-not-paid-box" className="p-4 bg-gradient-to-b from-amber-50/90 to-amber-50/40 border border-amber-200/90 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                            Anno Accademico 2026/2027
                          </span>
                        </div>
                        <h4 className="text-xs 2xl:text-sm font-bold text-amber-950 mt-1">
                          Quota d'iscrizione annuale (30,00 €)
                        </h4>
                        <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
                          La quota associativa è obbligatoria per tutti i nuovi corsisti. Scegli come preferisci saldarla:
                        </p>
                      </div>
                    </div>

                    {/* Radio cards selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Option 1: Pay online */}
                      <label
                        onClick={() => setValue("includeRegistrationFee", true)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${includeRegistrationFee !== false
                            ? "bg-white border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                            : "bg-white/60 border-amber-200/80 hover:bg-white hover:border-amber-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="feePaymentMethod"
                          checked={includeRegistrationFee !== false}
                          onChange={() => setValue("includeRegistrationFee", true)}
                          className="mt-0.5 text-[#043569] focus:ring-[#043569]"
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
                            <span className="font-bold text-[#043569]">Paga ora online</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1">
                            Aggiungi 30,00 € al totale del pagamento con carta.
                          </p>
                        </div>
                      </label>

                      {/* Option 2: Pay on site */}
                      <label
                        onClick={() => setValue("includeRegistrationFee", false)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${includeRegistrationFee === false
                            ? "bg-white border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                            : "bg-white/60 border-amber-200/80 hover:bg-white hover:border-amber-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="feePaymentMethod"
                          checked={includeRegistrationFee === false}
                          onChange={() => setValue("includeRegistrationFee", false)}
                          className="mt-0.5 text-[#043569] focus:ring-[#043569]"
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Storefront className="w-3.5 h-3.5 text-amber-700" weight="bold" />
                            <span className="font-bold text-amber-950">Paga in sede alla prima lezione</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1">
                            Salderai i 30,00 € in contanti o POS direttamente a scuola.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5 flex flex-col flex-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                    Note per il docente{" "}
                    <span className="font-normal text-slate-400 normal-case">(opzionale)</span>
                  </label>
                  <textarea
                    {...register("notes")}
                    placeholder="Esempio: Livello attuale, obiettivi o richieste particolari..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] focus:bg-white hover:border-slate-300 transition-all resize-none flex-1 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Dark sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col h-full">
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

                  {/* Dynamic Price breakdown */}
                  <div className="space-y-1.5 pt-2.5 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Prezzo corso</span>
                      <span className="font-bold text-white">€{coursePrice.toFixed(2)}</span>
                    </div>

                    {feeCheckStatus === "not_paid" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Quota iscrizione annuale</span>
                        {includeRegistrationFee !== false ? (
                          <span className="font-bold text-amber-400">€{ANNUAL_REGISTRATION_FEE_EUR.toFixed(2)}</span>
                        ) : (
                          <span className="font-semibold text-amber-300/80 text-[11px]">Da saldare in sede (€30,00)</span>
                        )}
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
                      Totale online
                    </span>
                    <div className="text-right">
                      <span className="text-xl 2xl:text-2xl font-black text-white">
                        {totalPrice.toFixed(2)} €
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
