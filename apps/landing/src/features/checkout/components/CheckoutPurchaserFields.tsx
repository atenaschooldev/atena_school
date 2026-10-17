"use client";

import React from "react";
import {
  User,
  SignIn,
  Envelope,
  Phone,
  IdentificationCard,
  Calendar as CalendarIcon,
  MapPin,
  Receipt,
  Spinner,
  CheckCircle,
  Info,
  Sparkle,
} from "@phosphor-icons/react";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile, FormFieldConfig } from "@atena/api-types";
import { FormFieldTarget } from "@atena/api-types";
import { sanitizeTaxCode, getCurrentAcademicYear, ANNUAL_REGISTRATION_FEE_EUR } from "@atena/utils";
import type { CheckoutFormValues } from "@/features/checkout/hooks/useCheckout";
import { FeeCheckStatus } from "@/constants";
import { getStudentPortalUrl, getLandingSiteUrl } from "@/lib/urls";
import { DynamicCustomFields } from "./DynamicCustomFields";

interface CheckoutPurchaserFieldsProps {
  register: UseFormRegister<CheckoutFormValues>;
  watch: UseFormWatch<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  user: SupabaseUser | UserProfile | null;
  courseId: string;
  dateParam?: string | null;
  timeParam?: string | null;
  feeCheckStatus?: FeeCheckStatus;
  savedProfileSource?: "local" | "account" | "draft" | null;
  onClearSavedProfile?: () => void;
  onOpenAuthModal?: () => void;
  customFields?: FormFieldConfig[];
  academicYear?: string;
  registrationFeeAmount?: number;
}

export function CheckoutPurchaserFields({
  register,
  watch,
  errors,
  user,
  courseId,
  dateParam,
  timeParam,
  feeCheckStatus,
  savedProfileSource,
  onClearSavedProfile,
  onOpenAuthModal,
  customFields = [],
  academicYear = getCurrentAcademicYear().academicYear,
  registrationFeeAmount = ANNUAL_REGISTRATION_FEE_EUR,
}: CheckoutPurchaserFieldsProps) {
  const isForChild = watch("isForChild");
  const needsCompanyInvoice = watch("needsCompanyInvoice");

  const targetCheckoutUrl = `${getLandingSiteUrl()}/checkout/${courseId}${
    dateParam ? `?date=${dateParam}&time=${timeParam}` : ""
  }`;
  const loginRedirectUrl = `${getStudentPortalUrl('/autenticazione/accedi')}?redirectTo=${encodeURIComponent(targetCheckoutUrl)}`;

  return (
    <>
      {/* Form Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <User className="w-4 h-4" weight="bold" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-black text-primary uppercase tracking-tight">
              Dati Anagrafici e Fiscali
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Utilizzati per il contratto e la ricevuta fiscale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!user ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-primary hover:text-secondary bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <SignIn className="w-3.5 h-3.5" />
              Accedi
            </button>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Account Connesso
            </span>
          )}
        </div>
      </div>

      {/* Returning Client / Saved Profile Banners */}
      {!user && !savedProfileSource && onOpenAuthModal && (
        <div className="bg-gradient-to-r from-primary/5 via-amber-500/5 to-primary/5 border border-primary/15 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-secondary shrink-0" weight="fill" />
            <p className="text-xs font-semibold text-slate-700 leading-snug">
              Sei già nostro corsista o genitore?
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <SignIn className="w-3.5 h-3.5 weight-bold" />
            Accedi per autocompilare
          </button>
        </div>
      )}

      {savedProfileSource === "local" && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
            <span className="text-[11px] sm:text-xs font-medium text-emerald-900">
              Dati caricati automaticamente da questo dispositivo.
            </span>
          </div>
          {onClearSavedProfile && (
            <button
              type="button"
              onClick={onClearSavedProfile}
              className="text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap cursor-pointer"
            >
              Azzera dati
            </button>
          )}
        </div>
      )}

      {savedProfileSource === "account" && (
        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" weight="fill" />
            <span className="text-[11px] sm:text-xs font-medium text-primary">
              Dati caricati dal tuo account.
            </span>
          </div>
          {onClearSavedProfile && (
            <button
              type="button"
              onClick={onClearSavedProfile}
              className="text-[10px] sm:text-[11px] font-bold text-primary hover:text-secondary underline whitespace-nowrap cursor-pointer"
            >
              Pulisci
            </button>
          )}
        </div>
      )}

      {/* Checkbox: Parent purchasing for child */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            {...register("isForChild")}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
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
            <label htmlFor="checkout-firstName" className="block text-xs font-bold text-slate-700 mb-1">
              {isForChild ? "Nome Genitore *" : "Nome *"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="checkout-firstName"
                type="text"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "checkout-firstName-error" : undefined}
                {...register("firstName")}
                placeholder="Mario"
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
              />
            </div>
            {errors.firstName && (
              <p id="checkout-firstName-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="checkout-lastName" className="block text-xs font-bold text-slate-700 mb-1">
              {isForChild ? "Cognome Genitore *" : "Cognome *"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="checkout-lastName"
                type="text"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "checkout-lastName-error" : undefined}
                {...register("lastName")}
                placeholder="Rossi"
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
              />
            </div>
            {errors.lastName && (
              <p id="checkout-lastName-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
            <div className="relative">
              <Envelope className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="checkout-email"
                type="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "checkout-email-error" : undefined}
                {...register("email")}
                placeholder="mario.rossi@gmail.com"
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
              />
            </div>
            {errors.email && (
              <p id="checkout-email-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="checkout-phone" className="block text-xs font-bold text-slate-700 mb-1">Telefono (WhatsApp) *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="checkout-phone"
                type="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
                {...register("phone")}
                placeholder="+39 340 1234567"
                className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
              />
            </div>
            {errors.phone && (
              <p id="checkout-phone-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Purchaser Custom Fields */}
        <DynamicCustomFields
          fields={customFields}
          target={FormFieldTarget.PURCHASER}
          register={register}
          errors={errors}
          inline={true}
        />

        {/* Purchaser Tax Code (when parent) OR Personal Tax Code (when purchasing for self) */}
        {isForChild ? (
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="checkout-purchaserTaxCode" className="block text-xs font-bold text-slate-700">Codice Fiscale Genitore *</label>
              {watch("purchaserTaxCode") && (watch("purchaserTaxCode")?.length || 0) < 16 && (
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {watch("purchaserTaxCode")?.length}/16
                </span>
              )}
            </div>
            <div className="relative min-w-0">
              <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="checkout-purchaserTaxCode"
                type="text"
                maxLength={16}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={!!errors.purchaserTaxCode}
                aria-describedby={errors.purchaserTaxCode ? "checkout-purchaserTaxCode-error" : undefined}
                {...register("purchaserTaxCode", {
                  onChange: (e) => {
                    e.target.value = sanitizeTaxCode(e.target.value).slice(0, 16);
                  },
                })}
                placeholder="RSSMRA80A01H501Z"
                className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium tracking-wider transition-all"
              />
            </div>
            {errors.purchaserTaxCode && (
              <p id="checkout-purchaserTaxCode-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.purchaserTaxCode.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
              <div className="min-w-0">
                <label htmlFor="checkout-studentBirthDate" className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita *</label>
                <div className="relative min-w-0 w-full overflow-hidden rounded-xl">
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    id="checkout-studentBirthDate"
                    type="date"
                    aria-invalid={!!errors.studentBirthDate}
                    aria-describedby={errors.studentBirthDate ? "checkout-studentBirthDate-error" : undefined}
                    {...register("studentBirthDate")}
                    className="block w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs appearance-none box-border border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
                  />
                </div>
                {errors.studentBirthDate && (
                  <p id="checkout-studentBirthDate-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.studentBirthDate.message}</p>
                )}
              </div>

              <div className="min-w-0">
                <label htmlFor="checkout-birthPlace" className="block text-xs font-bold text-slate-700 mb-1">Luogo di Nascita *</label>
                <div className="relative min-w-0 w-full overflow-hidden rounded-xl">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    id="checkout-birthPlace"
                    type="text"
                    aria-invalid={!!errors.birthPlace}
                    aria-describedby={errors.birthPlace ? "checkout-birthPlace-error" : undefined}
                    {...register("birthPlace")}
                    placeholder="es. Milano (MI)"
                    className="block w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs box-border border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
                  />
                </div>
                {errors.birthPlace && (
                  <p id="checkout-birthPlace-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.birthPlace.message}</p>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="checkout-taxCode" className="block text-xs font-bold text-slate-700">Codice Fiscale *</label>
                <div className="flex items-center gap-1.5">
                  {watch("taxCode") && (watch("taxCode")?.length || 0) < 16 && (
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      {watch("taxCode")?.length}/16
                    </span>
                  )}
                  {feeCheckStatus === FeeCheckStatus.CHECKING && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      <Spinner className="w-3 h-3 animate-spin text-primary" />
                      Verifica quota...
                    </span>
                  )}
                  {feeCheckStatus === FeeCheckStatus.PAID && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" weight="fill" />
                      Quota {academicYear} saldata (0€)
                    </span>
                  )}
                  {feeCheckStatus === FeeCheckStatus.NOT_PAID && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <Info className="w-3 h-3 text-amber-600" weight="bold" />
                      Quota annuale (+{registrationFeeAmount}€)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative min-w-0">
                <IdentificationCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="checkout-taxCode"
                  type="text"
                  maxLength={16}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={!!errors.taxCode}
                  aria-describedby={errors.taxCode ? "checkout-taxCode-error" : undefined}
                  {...register("taxCode", {
                    onChange: (e) => {
                      e.target.value = sanitizeTaxCode(e.target.value).slice(0, 16);
                    },
                  })}
                  placeholder="RSSMRA80A01H501Z"
                  className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium tracking-wider transition-all"
                />
              </div>
              {errors.taxCode && (
                <p id="checkout-taxCode-error" role="alert" className="text-[10px] text-red-500 mt-1 font-semibold">{errors.taxCode.message}</p>
              )}
            </div>

            {/* Student Custom Fields for self-registration */}
            <DynamicCustomFields
              fields={customFields}
              target={FormFieldTarget.STUDENT}
              register={register}
              errors={errors}
              inline={true}
            />
          </div>
        )}

        {/* Corporate Electronic Invoice Option (Fatturazione Elettronica B2B) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("needsCompanyInvoice")}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-primary" weight="bold" />
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
                      className="w-full max-w-full min-w-0 pl-8 pr-2.5 py-2 text-xs uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium tracking-wider transition-all"
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
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white font-medium transition-all"
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
