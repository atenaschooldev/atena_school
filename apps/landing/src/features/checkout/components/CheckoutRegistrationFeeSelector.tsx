"use client";

import React from "react";
import { CreditCard, Storefront } from "@phosphor-icons/react";
import type { UseFormSetValue } from "react-hook-form";
import { ANNUAL_REGISTRATION_FEE_EUR } from "@/constants";
import type { CheckoutFormValues } from "@/features/checkout/hooks/useCheckout";

interface CheckoutRegistrationFeeSelectorProps {
  stripeEnabled: boolean;
  hasAnyFeeDue: boolean;
  unpaidFeesCount: number;
  includeRegistrationFee?: boolean;
  setValue: UseFormSetValue<CheckoutFormValues>;
  registrationFeeAmount?: number;
}

export function CheckoutRegistrationFeeSelector({
  stripeEnabled,
  hasAnyFeeDue,
  unpaidFeesCount,
  includeRegistrationFee,
  setValue,
  registrationFeeAmount = ANNUAL_REGISTRATION_FEE_EUR,
}: CheckoutRegistrationFeeSelectorProps) {
  if (!stripeEnabled || !hasAnyFeeDue) {
    return null;
  }

  const isFeeIncluded = includeRegistrationFee !== false;

  return (
    <div className="bg-[#FFFBEB] rounded-xl p-3 sm:p-3.5 border border-[#FDE68A] space-y-2">
      <div className="space-y-0.5">
        <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">
          Anno Accademico 2026/2027
        </span>
        <h3 className="text-xs font-black text-[#78350F]">
          Quota d'iscrizione annuale ({registrationFeeAmount.toFixed(2)} €
          {unpaidFeesCount > 1 ? ` × ${unpaidFeesCount} = ${(unpaidFeesCount * registrationFeeAmount).toFixed(2)} €` : ""})
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
            isFeeIncluded
              ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
              : "border-amber-200/80 hover:border-amber-300 opacity-80"
          }`}
        >
          <input
            type="radio"
            name="feeOption"
            checked={isFeeIncluded}
            onChange={() => setValue("includeRegistrationFee", true)}
            className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-black text-[#043569]">
              <CreditCard className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
              <span>Paga ora online</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              Aggiungi +{(unpaidFeesCount * registrationFeeAmount).toFixed(2)} € al totale.
            </p>
          </div>
        </div>

        {/* Option 2: Paga in sede alla prima lezione */}
        <div
          onClick={() => setValue("includeRegistrationFee", false)}
          className={`p-2.5 rounded-lg border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
            !isFeeIncluded
              ? "border-[#043569] ring-2 ring-[#043569]/10 shadow-sm"
              : "border-amber-200/80 hover:border-amber-300 opacity-80"
          }`}
        >
          <input
            type="radio"
            name="feeOption"
            checked={!isFeeIncluded}
            onChange={() => setValue("includeRegistrationFee", false)}
            className="w-3.5 h-3.5 text-[#043569] border-slate-300 focus:ring-[#043569] mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-950">
              <Storefront className="w-3.5 h-3.5 text-[#F8861D]" weight="bold" />
              <span>Paga in sede alla prima lezione</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">
              Salderai {(unpaidFeesCount * registrationFeeAmount).toFixed(2)} € a scuola.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
