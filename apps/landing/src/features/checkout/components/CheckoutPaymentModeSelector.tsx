"use client";

import React from "react";
import { CreditCard, Storefront } from "@phosphor-icons/react";

interface CheckoutPaymentModeSelectorProps {
  stripeEnabled: boolean;
  selectedPaymentMode: "pay" | "book";
  setSelectedPaymentMode: (mode: "pay" | "book") => void;
}

export function CheckoutPaymentModeSelector({
  stripeEnabled,
  selectedPaymentMode,
  setSelectedPaymentMode,
}: CheckoutPaymentModeSelectorProps) {
  if (!stripeEnabled) {
    return null;
  }

  return (
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
  );
}
