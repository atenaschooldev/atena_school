"use client";

import React from "react";
import {
  User,
  SignIn,
  Envelope,
  Phone,
  IdentificationCard,
  Calendar as CalendarIcon,
  Receipt,
} from "@phosphor-icons/react";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@atena/api-types";
import type { CheckoutFormValues } from "@/features/checkout/hooks/useCheckout";

interface CheckoutPurchaserFieldsProps {
  register: UseFormRegister<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  user: SupabaseUser | UserProfile | null;
  courseId: string;
  dateParam?: string | null;
  timeParam?: string | null;
}

export function CheckoutPurchaserFields({
  register,
  watch,
  errors,
  user,
  courseId,
  dateParam,
  timeParam,
}: CheckoutPurchaserFieldsProps) {
  const isForChild = watch("isForChild");
  const needsCompanyInvoice = watch("needsCompanyInvoice");

  const loginRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"}/autenticazione/accedi?redirectTo=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/${courseId}${
      dateParam ? `?date=${dateParam}&time=${timeParam}` : ""
    }`
  )}`;

  return (
    <>
      {/* Form Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#043569]/10 text-[#043569] flex items-center justify-center font-bold shrink-0">
            <User className="w-4 h-4" weight="bold" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-black text-[#043569] uppercase tracking-tight">
              Dati Anagrafici e Fiscali
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Utilizzati per il contratto e la ricevuta fiscale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!user && (
            <a
              href={loginRedirectUrl}
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
          {isForChild ? "Dati del Genitore / Acquirente" : "Dati Personali"}
        </h3>

        {/* 2 columns even on mobile for Name / Surname */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isForChild ? "Nome Genitore *" : "Nome *"}
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
              {isForChild ? "Cognome Genitore *" : "Cognome *"}
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
        {isForChild ? (
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale Genitore *</label>
            <div className="relative min-w-0">
              <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={16}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                {...register("purchaserTaxCode", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase().slice(0, 16);
                  },
                })}
                placeholder="RSSMRA80A01H501Z"
                className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
              />
            </div>
            {errors.purchaserTaxCode && (
              <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.purchaserTaxCode.message}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita *</label>
              <div className="relative min-w-0">
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  {...register("studentBirthDate")}
                  className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium transition-all"
                />
              </div>
              {errors.studentBirthDate && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
              )}
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale *</label>
              <div className="relative min-w-0">
                <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={16}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  {...register("taxCode", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase().slice(0, 16);
                    },
                  })}
                  placeholder="RSSMRA80A01H501Z"
                  className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
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

          {needsCompanyInvoice && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5 min-w-0">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Inserisci il Codice Destinatario SDI (7 caratteri) e/o l'email PEC per l'invio della fattura all'Agenzia delle Entrate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Codice Destinatario SDI (7 caratteri)
                  </label>
                  <div className="relative min-w-0">
                    <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={7}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      {...register("sdiCode", {
                        onChange: (e) => {
                          e.target.value = e.target.value.toUpperCase().slice(0, 7);
                        },
                      })}
                      placeholder="es. SUBM70N o 0000000"
                      className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white font-medium tracking-wider transition-all"
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
    </>
  );
}
