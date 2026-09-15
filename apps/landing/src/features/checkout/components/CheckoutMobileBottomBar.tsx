"use client";

import React from "react";
import { ArrowRight, Spinner } from "@phosphor-icons/react";
import type { SubmitAction } from "@/features/checkout/hooks/useCheckout";

interface CheckoutMobileBottomBarProps {
  totalPrice: number;
  selectedPaymentMode: "pay" | "book";
  actionRef: React.MutableRefObject<SubmitAction>;
  submitting: false | "book" | "pay";
  isAnyFeeChecking: boolean;
}

export function CheckoutMobileBottomBar({
  totalPrice,
  selectedPaymentMode,
  actionRef,
  submitting,
  isAnyFeeChecking,
}: CheckoutMobileBottomBarProps) {
  return (
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
          disabled={!!submitting || isAnyFeeChecking}
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
  );
}
