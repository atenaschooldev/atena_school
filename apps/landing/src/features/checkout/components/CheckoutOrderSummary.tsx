"use client";

import React from "react";
import Image from "next/image";
import {
  User,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Storefront,
  Spinner,
  ShieldCheck,
  Headset,
} from "@phosphor-icons/react";
import type { BookingItem } from "@/features/checkout/hooks/useCheckout";
import { SubmitAction } from "@/constants";

interface CheckoutOrderSummaryProps {
  item: BookingItem | null;
  title: string;
  coursePrice: number;
  studentCount: number;
  totalCoursePrice: number;
  hasAnyFeeDue: boolean;
  includeRegistrationFee?: boolean;
  unpaidFeesCount: number;
  totalRegistrationFees: number;
  totalPrice: number;
  dateParam?: string | null;
  timeParam?: string | null;
  formattedDateString: (dStr?: string | null) => string | null;
  formatCategoryName: (cat?: string) => string;
  mounted: boolean;
  selectedPaymentMode: SubmitAction;
  actionRef: React.MutableRefObject<SubmitAction>;
  submitting: false | SubmitAction;
  isAnyFeeChecking: boolean;
  stripeEnabled: boolean;
  isSubscription?: boolean;
}

export function CheckoutOrderSummary({
  item,
  title,
  coursePrice,
  studentCount,
  totalCoursePrice,
  hasAnyFeeDue,
  includeRegistrationFee,
  unpaidFeesCount,
  totalRegistrationFees,
  totalPrice,
  dateParam,
  timeParam,
  formattedDateString,
  formatCategoryName,
  mounted,
  selectedPaymentMode,
  actionRef,
  submitting,
  isAnyFeeChecking,
  stripeEnabled,
  isSubscription,
}: CheckoutOrderSummaryProps) {
  return (
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
          <div
            className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs"
            suppressHydrationWarning
          >
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
            <span className="text-slate-600 font-medium">
              {isSubscription ? "Abbonamento Mensile (1° mese)" : "Prezzo Corso"}{" "}
              {studentCount > 1 ? `(${studentCount}x ${coursePrice.toFixed(2)}€${isSubscription ? "/mese" : ""})` : ""}
            </span>
            <span className="font-bold text-slate-800">{totalCoursePrice.toFixed(2)}€</span>
          </div>

          {hasAnyFeeDue && includeRegistrationFee !== false && (
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="text-slate-600 font-medium">
                Quota iscrizione annuale {unpaidFeesCount > 1 ? `(${unpaidFeesCount}x 30€)` : ""}
              </span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                +{totalRegistrationFees.toFixed(2)}€
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline justify-between" aria-live="polite" aria-atomic="true">
          <div>
            <span className="text-xs font-black text-[#043569] uppercase tracking-wider block">Totale</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {isSubscription ? "1° mese + quota (se dovuta)" : "Tasse e IVA incluse"}
            </span>
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
            disabled={!!submitting || isAnyFeeChecking}
            className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedPaymentMode === SubmitAction.PAY
                ? "bg-[#F8861D] text-white hover:bg-[#e8741a] shadow-[#F8861D]/20"
                : "bg-[#043569] text-white hover:bg-[#032852] shadow-[#043569]/20"
            }`}
          >
            {submitting ? (
              <Spinner className="w-4 h-4 animate-spin text-white" />
            ) : isAnyFeeChecking ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4 animate-spin text-white" />
                Verifica quota in corso...
              </span>
            ) : selectedPaymentMode === SubmitAction.PAY ? (
              <>
                <CreditCard className="w-4 h-4" weight="bold" />
                {isSubscription ? `Attiva Abbonamento Online (${totalPrice.toFixed(2)}€)` : `Paga Online Ora (${totalPrice.toFixed(2)}€)`}
              </>
            ) : (
              <>
                <Storefront className="w-4 h-4 text-white" weight="bold" />
                {isSubscription ? `Prenota Abbonamento in Sede (${totalPrice.toFixed(2)}€)` : `Prenota e Paga in Sede (${totalPrice.toFixed(2)}€)`}
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
  );
}
