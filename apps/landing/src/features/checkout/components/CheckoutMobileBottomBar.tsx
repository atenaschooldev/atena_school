"use client";

import React from "react";
import { ArrowRight, Spinner } from "@phosphor-icons/react";
import { SubmitAction } from "@/constants";

interface CheckoutMobileBottomBarProps {
  totalPrice: number;
  selectedPaymentMode: SubmitAction;
  actionRef: React.MutableRefObject<SubmitAction>;
  submitting: false | SubmitAction;
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
        <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {selectedPaymentMode === SubmitAction.PAY ? "Totale Checkout" : "Totale da Saldare"}
          </p>
          <p className="text-xl font-black text-secondary leading-none">{totalPrice.toFixed(2)}€</p>
        </div>

        <button
          form="checkout-form"
          type="submit"
          onClick={() => {
            actionRef.current = selectedPaymentMode;
          }}
          disabled={!!submitting || isAnyFeeChecking}
          className={`px-5 py-3 rounded-xl font-black uppercase tracking-wide text-xs sm:text-sm shadow-lg active:scale-95 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
            selectedPaymentMode === SubmitAction.PAY
              ? "bg-secondary text-white shadow-secondary/30"
              : "bg-primary text-white shadow-primary/30"
          }`}
        >
          {submitting ? (
            <Spinner className="w-4 h-4 animate-spin text-white" />
          ) : selectedPaymentMode === SubmitAction.PAY ? (
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
