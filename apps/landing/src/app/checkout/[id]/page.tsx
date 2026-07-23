"use client";

import React, { Suspense, use } from "react";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Caricamento informazioni...</p>
        </div>
      </div>
    );
  }

  const coursePrice = Number(item?.price || 0);
  const isFeeAddedToOnlineTotal = feeCheckStatus === "not_paid" && includeRegistrationFee !== false;
  const totalPrice = coursePrice + (isFeeAddedToOnlineTotal ? ANNUAL_REGISTRATION_FEE_EUR : 0);
  const title = item?.title_it || item?.name || "Corso Atena School";

  const formatCategoryName = (cat?: string): string => {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower === "languages" || lower === "language") return "Corsi di Lingua";
    if (lower === "academic" || lower === "recupero") return "Recupero Scolastico";
    if (lower === "certipass" || lower === "eipass") return "Certificazioni EIPASS";
    return cat;
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pt-20 pb-24 relative">
      {/* Background soft gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#043569]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F8861D]/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          href={`/courses/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#043569] transition-colors group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Torna alla scheda del corso
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Informational Header */}
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-[#F8861D] block mb-1">Iscrizione e Checkout</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#043569] tracking-tight">
            Completa l'iscrizione
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Inserisci i dati dello studente e seleziona la modalità di pagamento desiderata.
          </p>
        </div>

        {/* Main Grid */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT FORM CARD (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-8">

            {/* Form Section Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#043569]/10 text-[#043569] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" weight="bold" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#043569] uppercase tracking-tight">Dati Anagrafici e Fiscali</h2>
                  <p className="text-xs text-slate-400 font-medium">I dati verranno utilizzati per il contratto e la ricevuta fiscale</p>
                </div>
              </div>

              {!user && (
                <Link
                  href={`/auth/login?redirectTo=${encodeURIComponent(`/checkout/${id}${dateParam ? `?date=${dateParam}&time=${timeParam}` : ""}`)}`}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#043569] hover:text-[#F8861D] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <SignIn className="w-4 h-4" />
                  Hai già un account?
                </Link>
              )}
            </div>

            {/* Checkbox: Parent purchasing for child */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isForChild")}
                  className="w-4 h-4 rounded border-slate-300 text-[#043569] focus:ring-[#043569]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Sto iscrivendo un figlio o minorenne (sono un genitore)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Seleziona se l'intestatario del corso è diverso da chi effettua il pagamento.
                  </span>
                </div>
              </label>
            </div>

            {/* Purchaser / Parent Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {watch("isForChild") ? "Dati del Genitore / Acquirente" : "Dati Personali"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {watch("isForChild") ? "Nome Genitore *" : "Nome *"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("firstName")}
                      placeholder="Mario"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
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
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("lastName")}
                      placeholder="Rossi"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (per ricevuta e comunicazioni) *</label>
                  <div className="relative">
                    <Envelope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="mario.rossi@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefono (WhatsApp) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="+39 340 1234567"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale Genitore (Acquirente per Ricevuta) *</label>
                  <div className="relative">
                    <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register("purchaserTaxCode")}
                      placeholder="RSSMRA80A01H501Z"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium tracking-wider"
                    />
                  </div>
                  {errors.purchaserTaxCode && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.purchaserTaxCode.message}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita (opzionale)</label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        {...register("studentBirthDate")}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentBirthDate && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale *</label>
                    <div className="relative">
                      <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("taxCode")}
                        placeholder="RSSMRA80A01H501Z"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium tracking-wider"
                      />
                    </div>
                    {errors.taxCode && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.taxCode.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Corporate Electronic Invoice Option (Fatturazione Elettronica B2B) */}
              <div className="pt-2.5 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
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
                  <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Inserisci il Codice Destinatario SDI (7 caratteri) e/o l'email PEC per l'invio della fattura all'Agenzia delle Entrate.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Codice Destinatario SDI (7 caratteri)</label>
                        <div className="relative">
                          <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={7}
                            {...register("sdiCode")}
                            placeholder="es. SUBM70N o 0000000"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium tracking-wider"
                          />
                        </div>
                        {errors.sdiCode && (
                          <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.sdiCode.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email PEC Aziendale</label>
                        <div className="relative">
                          <Envelope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            {...register("pecEmail")}
                            placeholder="azienda@pec.it"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
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
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#043569]">Dati dello Studente (Figlio)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Figlio/a *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("studentFirstName")}
                        placeholder="Luca"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentFirstName && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentFirstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cognome Figlio/a *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("studentLastName")}
                        placeholder="Rossi"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentLastName && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentLastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Studente (opzionale)</label>
                    <div className="relative">
                      <Envelope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        {...register("studentEmail")}
                        placeholder="luca.rossi@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentEmail && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefono Studente (opzionale)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        {...register("studentPhone")}
                        placeholder="+39 340 9876543"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentPhone && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita Studente (opzionale)</label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        {...register("studentBirthDate")}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium"
                      />
                    </div>
                    {errors.studentBirthDate && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale dello Studente *</label>
                    <div className="relative">
                      <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register("taxCode")}
                        placeholder="PTBNS2345236754723"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white font-medium tracking-wider"
                      />
                    </div>
                    {errors.taxCode && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.taxCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Note o richieste per la segreteria (opzionale)</label>
              <textarea
                rows={2}
                {...register("notes")}
                placeholder="Es. preferenze orarie, segnalazioni didattiche..."
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#043569] bg-white resize-none font-medium"
              />
            </div>

            {/* Fee Status Card 1: ALREADY PAID (Green Badge) */}
            {feeCheckStatus === "paid" && (
              <div className="bg-emerald-50/90 rounded-3xl p-5 border border-emerald-200/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle className="w-5 h-5" weight="fill" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-tight">
                      Quota d'iscrizione annuale 2026/2027 già versata
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      Tesseramento Attivo
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    La quota di iscrizione annuale (€30,00) per questo studente risulta già regolarmente saldata per l'anno accademico in corso. Non è richiesto alcun versamento aggiuntivo.
                  </p>
                </div>
              </div>
            )}

            {/* Fee Status Card 2: NOT PAID (Yellow Choice Card) */}
            {feeCheckStatus === "not_paid" && (
              <div className="bg-[#FFFBEB] rounded-3xl p-5 sm:p-6 border border-[#FDE68A] space-y-4">
                <div className="space-y-1">
                  <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                    Anno Accademico 2026/2027
                  </span>
                  <h3 className="text-base font-black text-[#78350F]">
                    Quota d'iscrizione annuale (30,00 €)
                  </h3>
                  <p className="text-xs text-[#92400E] font-medium">
                    La quota associativa è obbligatoria per tutti i nuovi corsisti. Scegli come preferisci saldarla:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Option 1: Paga ora online */}
                  <div
                    onClick={() => setValue("includeRegistrationFee", true)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex items-start gap-3 ${includeRegistrationFee !== false
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-amber-200/80 hover:border-amber-300 opacity-80"
                      }`}
                  >
                    <input
                      type="radio"
                      name="feeOption"
                      checked={includeRegistrationFee !== false}
                      onChange={() => setValue("includeRegistrationFee", true)}
                      className="w-4 h-4 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#043569]">
                        <CreditCard className="w-4 h-4 text-[#043569]" weight="bold" />
                        <span>Paga ora online</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug">
                        Aggiungi 30,00 € al totale del pagamento con carta.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Paga in sede alla prima lezione */}
                  <div
                    onClick={() => setValue("includeRegistrationFee", false)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white flex items-start gap-3 ${includeRegistrationFee === false
                        ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
                        : "border-amber-200/80 hover:border-amber-300 opacity-80"
                      }`}
                  >
                    <input
                      type="radio"
                      name="feeOption"
                      checked={includeRegistrationFee === false}
                      onChange={() => setValue("includeRegistrationFee", false)}
                      className="w-4 h-4 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                        <Storefront className="w-4 h-4 text-[#F8861D]" weight="bold" />
                        <span>Paga in sede alla prima lezione</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug">
                        Salderai i 30,00 € in contanti o POS direttamente a scuola.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT STICKY ORDER SUMMARY (5 cols on lg, 4 cols on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">

              {/* Summary Header & Thumbnail */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Riepilogo Scheda Corso
                </span>

                {/* Course Thumbnail */}
                {item?.photo_url && (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image
                      src={item.photo_url}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  {item?.category && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#043569] bg-[#043569]/10 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                      {formatCategoryName(item.category)}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-[#043569] leading-tight">
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
              {dateParam ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-[#F8861D]" weight="bold" />
                      Data inizio:
                    </span>
                    <span className="font-black text-[#043569] uppercase">
                      {format(new Date(dateParam), "d MMMM yyyy", { locale: dateLocale })}
                    </span>
                  </div>
                  {timeParam && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#043569]" weight="bold" />
                        Orario lezioni:
                      </span>
                      <span className="font-bold text-slate-800">{timeParam}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-[#043569] block mb-0.5">Orario flessibile / da concordare</span>
                  I giorni e gli orari verranno definiti insieme alla segreteria dopo l'iscrizione.
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Prezzo Corso</span>
                  <span className="font-bold text-slate-800">{coursePrice.toFixed(2)}€</span>
                </div>

                {feeCheckStatus === "not_paid" && (
                  <div className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-slate-600 font-medium">Quota iscrizione annuale</span>
                    {includeRegistrationFee !== false ? (
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        +{ANNUAL_REGISTRATION_FEE_EUR.toFixed(2)}€
                      </span>
                    ) : (
                      <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                        Da saldare in sede (30,00€)
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black text-[#043569] uppercase tracking-wider block">Totale</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Tasse e IVA incluse</span>
                  </div>
                  <span className="text-3xl font-black text-[#F8861D]">{totalPrice.toFixed(2)}€</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  onClick={() => {
                    actionRef.current = "pay";
                  }}
                  disabled={!!submitting}
                  className="w-full py-4 bg-[#F8861D] text-white hover:bg-[#043569] rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all duration-300 shadow-lg shadow-[#F8861D]/15 hover:shadow-none flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {submitting === "pay" ? (
                    <Spinner className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" weight="bold" />
                      Paga Online Ora ({totalPrice.toFixed(2)}€)
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  onClick={() => {
                    actionRef.current = "book";
                  }}
                  disabled={!!submitting}
                  className="w-full py-3.5 bg-white text-[#043569] border border-[#043569]/20 hover:border-[#043569] hover:bg-[#043569]/5 rounded-2xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {submitting === "book" ? (
                    <Spinner className="w-4 h-4 animate-spin text-[#043569]" />
                  ) : (
                    <>
                      <Storefront className="w-4 h-4 text-[#043569]" weight="bold" />
                      Prenota e Paga in Sede
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" weight="fill" />
                  Stripe 256-bit SSL
                </span>
                <span className="flex items-center gap-1.5">
                  <Headset className="w-4 h-4 text-[#043569]" weight="fill" />
                  Assistenza Atena
                </span>
              </div>

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
        </div>
      }
    >
      <CheckoutContent params={params} />
    </Suspense>
  );
}
