"use client";

import React, { Suspense, use, useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { it as dateLocale } from "date-fns/locale";
import {
  User,
  Envelope,
  Phone,
  Calendar as CalendarIcon,
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  Headset,
  SignIn,
  CreditCard,
  Storefront,
  Spinner,
  CaretLeft,
  Info,
  IdentificationCard,
  Receipt,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";

function CheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    formMethods,
    item,
    loading,
    stripeEnabled,
    submitting,
    feeCheckStatus,
    user,
    dateParam,
    timeParam,
    actionRef,
    onSubmit,
  } = useCheckout(id);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = formMethods;
  const includeRegistrationFee = watch("includeRegistrationFee");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"pay" | "book">("book");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!stripeEnabled) {
      setSelectedPaymentMode("book");
      setValue("includeRegistrationFee", false);
    } else {
      setSelectedPaymentMode("pay");
      setValue("includeRegistrationFee", true);
    }
  }, [stripeEnabled, setValue]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caricamento informazioni...</p>
        </div>
      </div>
    );
  }

  const coursePrice = Number(item?.price || 0);
  const isRegistrationFeeDue = feeCheckStatus === "not_paid";
  const totalPrice = coursePrice + (isRegistrationFeeDue ? ANNUAL_REGISTRATION_FEE_EUR : 0);
  const title = item?.title_it || item?.name || "Corso Atena School";

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
    return cat;
  };

  const formattedDateString = (dStr?: string | null) => {
    if (!dStr) return null;
    try {
      return format(new Date(dStr), "d MMMM yyyy", { locale: dateLocale });
    } catch (e) {
      return dStr;
    }
  };

  return (
    <main className="bg-slate-100 min-h-screen pt-20 sm:pt-24 pb-28 lg:pb-8 font-sans flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4">

        {/* Back Link to Course Page */}
        <div className="mb-2">
          <Link
            href={`/corsi/${item?.slug || id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#043569] transition-colors group"
          >
            <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Torna alla scheda del corso
          </Link>
        </div>

        {/* Header Title */}
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F8861D] block mb-0.5">Iscrizione e Checkout</span>
          <h1 className="text-xl sm:text-3xl font-black text-[#043569] tracking-tight">
            Completa l'iscrizione
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
            Inserisci i dati dello studente e seleziona la modalità di pagamento desiderata.
          </p>
        </div>

        {/* MOBILE TOP COURSE SUMMARY CARD (Visible ONLY on mobile lg:hidden) */}
        <div className="lg:hidden mb-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 space-y-3">
          <div className="flex items-center gap-3">
            {item?.photo_url && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <Image
                  src={item.photo_url}
                  alt={title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {item?.category && (
                <span className="text-[9px] font-black uppercase tracking-wider text-[#043569] bg-[#043569]/10 px-2 py-0.5 rounded-md inline-block mb-0.5">
                  {formatCategoryName(item.category)}
                </span>
              )}
              <h3 className="text-sm font-black text-[#043569] truncate leading-tight">
                {title}
              </h3>
              <p className="text-xs font-bold text-[#F8861D] mt-0.5">
                Prezzo corso: {coursePrice.toFixed(2)}€
              </p>
            </div>
          </div>

          {/* Date & Time Summary on Mobile */}
          {dateParam && mounted && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]" suppressHydrationWarning>
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                Data inizio: <strong className="text-[#043569] uppercase">{formattedDateString(dateParam)}</strong>
              </span>
              {timeParam && (
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
                  Orario: <strong className="text-slate-800">{timeParam}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Form Grid — Mobile Sticky Bottom Bar MUST be inside form tag to submit reliably */}
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-5 items-start">

          {/* LEFT FORM CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">

            {/* Form Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#043569]/10 text-[#043569] flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4" weight="bold" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-base font-black text-[#043569] uppercase tracking-tight">Dati Anagrafici e Fiscali</h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Utilizzati per il contratto e la ricevuta fiscale</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {!user && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/autenticazione/accedi?redirectTo=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/${id}${dateParam ? `?date=${dateParam}&time=${timeParam}` : ""}`)}`}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#043569] hover:text-[#F8861D] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                  >
                    <SignIn className="w-3.5 h-3.5" />
                    Accedi
                  </a>
                )}
              </div>
            </div>

            {/* Checkbox: Parent purchasing for child */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isForChild")}
                  className="w-4 h-4 rounded border-slate-300 text-[#043569] focus:ring-[#043569] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-snug">
                    Sto iscrivendo un figlio o minorenne (sono un genitore)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Seleziona se l'intestatario del corso è diverso da chi effettua il pagamento.
                  </span>
                </div>
              </label>
            </div>

            {/* Purchaser / Parent Fields */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {watch("isForChild") ? "Dati del Genitore / Acquirente" : "Dati Personali"}
              </h3>

              {/* 2 columns even on mobile for Name / Surname */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {watch("isForChild") ? "Nome Genitore *" : "Nome *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("firstName")}
                      placeholder="Mario"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {watch("isForChild") ? "Cognome Genitore *" : "Cognome *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("lastName")}
                      placeholder="Rossi"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <div className="relative">
                    <Envelope className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="mario.rossi@gmail.com"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefono (WhatsApp) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+39 340 1234567"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Purchaser Tax Code (when parent) OR Personal Tax Code (when purchasing for self) */}
              {watch("isForChild") ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale Genitore *</label>
                  <div className="relative">
                    <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("purchaserTaxCode")}
                      placeholder="RSSMRA80A01H501Z"
                      className="w-full pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
                    />
                  </div>
                  {errors.purchaserTaxCode && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.purchaserTaxCode.message}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita (opzionale)</label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        {...register("studentBirthDate")}
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentBirthDate && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale *</label>
                    <div className="relative">
                      <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("taxCode")}
                        placeholder="RSSMRA80A01H501Z"
                        className="w-full pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
                      />
                    </div>
                    {errors.taxCode && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.taxCode.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Corporate Electronic Invoice Option (Fatturazione Elettronica B2B) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("needsCompanyInvoice")}
                    className="w-4 h-4 rounded border-slate-300 text-[#043569] focus:ring-[#043569]"
                  />
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#043569]" weight="bold" />
                    Richiedo fatturazione elettronica aziendale (Azienda / P.IVA / Freelance)
                  </span>
                </label>

                {watch("needsCompanyInvoice") && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Inserisci il Codice Destinatario SDI (7 caratteri) e/o l'email PEC per l'invio della fattura all'Agenzia delle Entrate.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Codice Destinatario SDI (7 caratteri)</label>
                        <div className="relative">
                          <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={7}
                            {...register("sdiCode")}
                            placeholder="es. SUBM70N o 0000000"
                            className="w-full pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
                          />
                        </div>
                        {errors.sdiCode && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.sdiCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email PEC Aziendale</label>
                        <div className="relative">
                          <Envelope className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            {...register("pecEmail")}
                            placeholder="azienda@pec.it"
                            className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                          />
                        </div>
                        {errors.pecEmail && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.pecEmail.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student Details (If child) */}
            {watch("isForChild") && (
              <div className="space-y-3 pt-3 border-t border-slate-100 bg-[#043569]/[0.02] p-3 rounded-xl border border-[#043569]/10">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[#043569]">Dati dello Studente (Figlio)</h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Figlio/a *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("studentFirstName")}
                        placeholder="Luca"
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentFirstName && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentFirstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cognome Figlio/a *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("studentLastName")}
                        placeholder="Rossi"
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentLastName && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentLastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Studente (opzionale)</label>
                    <div className="relative">
                      <Envelope className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        {...register("studentEmail")}
                        placeholder="luca.rossi@gmail.com"
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentEmail && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefono Studente (opzionale)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        {...register("studentPhone")}
                        placeholder="+39 340 9876543"
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentPhone && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita Studente (opzionale)</label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        {...register("studentBirthDate")}
                        className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                      />
                    </div>
                    {errors.studentBirthDate && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale Studente *</label>
                    <div className="relative">
                      <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("taxCode")}
                        placeholder="RSSLCU10A01H501Z"
                        className="w-full pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
                      />
                    </div>
                    {errors.taxCode && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.taxCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Registration Fee Card: Render ONLY when Stripe is enabled and feeCheckStatus is 'not_paid' */}
            {stripeEnabled && feeCheckStatus === "not_paid" && (
              <div className="bg-[#FFFBEB] rounded-xl p-3 sm:p-3.5 border border-[#FDE68A] space-y-2">
                <div className="space-y-0.5">
                  <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">
                    Anno Accademico 2026/2027
                  </span>
                  <h3 className="text-xs font-black text-[#78350F]">
                    Quota d'iscrizione annuale (30,00 €)
                  </h3>
                  <p className="text-[11px] text-[#92400E] font-medium leading-tight">
                    La quota associativa è obbligatoria per tutti i nuovi corsisti. Scegli come preferisci saldarla:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  {/* Option 1: Paga ora online */}
                  <div
                    onClick={() => setValue("includeRegistrationFee", true)}
                    className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
                      includeRegistrationFee !== false
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-amber-200/80 hover:border-amber-300 opacity-80"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeOption"
                      checked={includeRegistrationFee !== false}
                      onChange={() => setValue("includeRegistrationFee", true)}
                      className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-black text-[#043569]">
                        <CreditCard className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
                        <span>Paga ora online</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Aggiungi 30,00 € al totale del pagamento.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Paga in sede alla prima lezione */}
                  <div
                    onClick={() => setValue("includeRegistrationFee", false)}
                    className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
                      includeRegistrationFee === false
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-amber-200/80 hover:border-amber-300 opacity-80"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feeOption"
                      checked={includeRegistrationFee === false}
                      onChange={() => setValue("includeRegistrationFee", false)}
                      className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px] font-black text-amber-950">
                        <Storefront className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                        <span>Paga in sede alla prima lezione</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Salderai 30,00 € direttamente a scuola.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selector: Render ONLY when Stripe is enabled */}
            {stripeEnabled && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modalità di Pagamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Online */}
                  <div
                    onClick={() => setSelectedPaymentMode("pay")}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
                      selectedPaymentMode === "pay"
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={selectedPaymentMode === "pay"}
                      onChange={() => setSelectedPaymentMode("pay")}
                      className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-[#043569] flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
                        Paga subito online
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                        Carta, Apple Pay o Google Pay.
                      </span>
                    </div>
                  </div>

                  {/* Option 2: In Sede */}
                  <div
                    onClick={() => setSelectedPaymentMode("book")}
                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
                      selectedPaymentMode === "book"
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 opacity-75"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={selectedPaymentMode === "book"}
                      onChange={() => setSelectedPaymentMode("book")}
                      className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <Storefront className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                        Prenota e paga in sede
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                        Blocca il posto e saldi a scuola.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Note o richieste per la segreteria (opzionale)</label>
              <textarea
                rows={2}
                maxLength={500}
                {...register("notes")}
                placeholder="Es. preferenze orarie, segnalazioni didattiche..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white resize-none font-medium transition-all"
              />
              {errors.notes && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* RIGHT ORDER SUMMARY CARD (Visible on Desktop lg:block) */}
          <div className="hidden lg:block lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-5 space-y-4">

            {/* Top Content */}
            <div className="space-y-4">

              {/* Summary Header & Thumbnail */}
              <div className="space-y-3 pb-3.5 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Riepilogo Scheda Corso
                </span>

                {/* Course Thumbnail */}
                {item?.photo_url && (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image
                      src={item.photo_url}
                      alt={title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 360px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  {item?.category && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#043569] bg-[#043569]/10 px-2.5 py-0.5 rounded-md inline-block mb-1">
                      {formatCategoryName(item.category)}
                    </span>
                  )}
                  <h3 className="text-lg font-black text-[#043569] leading-tight">
                    {title}
                  </h3>
                  {item?.teacher_name && (
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                      Docente: {item.teacher_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Date & Schedule Selection Summary */}
              {dateParam && mounted && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs" suppressHydrationWarning>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
                      Data inizio:
                    </span>
                    <span className="font-black text-[#043569] uppercase">
                      {formattedDateString(dateParam)}
                    </span>
                  </div>
                  {timeParam && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
                        Orario lezioni:
                      </span>
                      <span className="font-bold text-slate-800">{timeParam}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Prezzo Corso</span>
                  <span className="font-bold text-slate-800">{coursePrice.toFixed(2)}€</span>
                </div>

                {feeCheckStatus === "not_paid" && (
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-slate-600 font-medium">Quota iscrizione annuale</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      +{ANNUAL_REGISTRATION_FEE_EUR.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Area */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black text-[#043569] uppercase tracking-wider block">Totale</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Tasse e IVA incluse</span>
                </div>
                <span className="text-3xl font-black text-[#F8861D]">{totalPrice.toFixed(2)}€</span>
              </div>

              {/* Action Button — Dynamically matches selectedPaymentMode */}
              <div>
                <button
                  form="checkout-form"
                  type="submit"
                  onClick={() => {
                    actionRef.current = selectedPaymentMode;
                  }}
                  disabled={!!submitting || feeCheckStatus === "checking"}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedPaymentMode === "pay"
                      ? "bg-[#F8861D] text-white hover:bg-[#e8741a] shadow-[#F8861D]/20"
                      : "bg-[#043569] text-white hover:bg-[#032852] shadow-[#043569]/20"
                  }`}
                >
                  {submitting ? (
                    <Spinner className="w-4 h-4 animate-spin text-white" />
                  ) : feeCheckStatus === "checking" ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="w-4 h-4 animate-spin text-white" />
                      Verifica quota in corso...
                    </span>
                  ) : selectedPaymentMode === "pay" ? (
                    <>
                      <CreditCard className="w-4 h-4" weight="bold" />
                      Paga Online Ora ({totalPrice.toFixed(2)}€)
                    </>
                  ) : (
                    <>
                      <Storefront className="w-4 h-4 text-white" weight="bold" />
                      Prenota e Paga in Sede ({totalPrice.toFixed(2)}€)
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" weight="fill" />
                  {stripeEnabled ? "Stripe 256-bit SSL" : "Prenotazione Protetta"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Headset className="w-3.5 h-3.5 text-[#043569]" weight="fill" />
                  Assistenza Atena
                </span>
              </div>
            </div>

          </div>

          {/* Mobile Sticky Bottom Bar — Inside form grid so it submits form id="checkout-form" */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-4 py-3 shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedPaymentMode === "pay" ? "Totale Checkout" : "Totale da Saldare"}
                </p>
                <p className="text-xl font-black text-[#F8861D] leading-none">{totalPrice.toFixed(2)}€</p>
              </div>

              <button
                form="checkout-form"
                type="submit"
                onClick={() => {
                  actionRef.current = selectedPaymentMode;
                }}
                disabled={!!submitting || feeCheckStatus === "checking"}
                className={`px-5 py-3 rounded-xl font-black uppercase tracking-wide text-xs sm:text-sm shadow-lg active:scale-95 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  selectedPaymentMode === "pay"
                    ? "bg-[#F8861D] text-white shadow-[#F8861D]/30"
                    : "bg-[#043569] text-white shadow-[#043569]/30"
                }`}
              >
                {submitting ? (
                  <Spinner className="w-4 h-4 animate-spin text-white" />
                ) : selectedPaymentMode === "pay" ? (
                  <>
                    Paga Online
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </>
                ) : (
                  <>
                    Prenota in Sede
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </main>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
        </div>
      }
    >
      <CheckoutContent params={params} />
    </Suspense>
  );
}
