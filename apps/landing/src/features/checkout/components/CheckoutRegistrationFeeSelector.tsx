"use client";

import React from "react";
import { CreditCard, Storefront } from "@phosphor-icons/react";
import type { UseFormSetValue } from "react-hook-form";
import { ANNUAL_REGISTRATION_FEE_EUR, getCurrentAcademicYear } from "@atena/utils";
import type { CheckoutFormValues } from "@/features/checkout/hooks/useCheckout";

interface CheckoutRegistrationFeeSelectorProps {
  stripeEnabled: boolean;
  hasAnyFeeDue: boolean;
  unpaidFeesCount: number;
  includeRegistrationFee?: boolean;
  setValue?: UseFormSetValue<CheckoutFormValues>;
  registrationFeeAmount?: number;
  academicYear?: string;
}

export function CheckoutRegistrationFeeSelector({
  stripeEnabled,
  hasAnyFeeDue,
  unpaidFeesCount,
  registrationFeeAmount = ANNUAL_REGISTRATION_FEE_EUR,
  academicYear = getCurrentAcademicYear().academicYear,
}: CheckoutRegistrationFeeSelectorProps) {
  if (!stripeEnabled || !hasAnyFeeDue) {
    return null;
  }

  const totalFee = unpaidFeesCount * registrationFeeAmount;

  return (
    <div className="bg-[#FFFBEB] rounded-xl p-3 sm:p-3.5 border border-[#FDE68A] space-y-1.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border border-amber-300/40">
          Anno Accademico {academicYear}
        </span>
        <span className="text-xs font-black text-[#78350F] bg-amber-100/80 px-2 py-0.5 rounded-md">
          +{totalFee.toFixed(2)} €
        </span>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-xs font-black text-[#78350F]">
          Quota d'iscrizione annuale inclusa nel pagamento
        </h3>
        <p className="text-[11px] text-[#92400E] font-medium leading-tight">
          La quota associativa obbligatoria ({registrationFeeAmount.toFixed(2)} €
          {unpaidFeesCount > 1 ? ` × ${unpaidFeesCount}` : ""}) viene inclusa automaticamente nel totale del pagamento online.
        </p>
      </div>
    </div>
  );
}

