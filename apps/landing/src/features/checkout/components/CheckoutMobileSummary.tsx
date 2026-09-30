"use client";

import React from "react";
import Image from "next/image";
import { Calendar as CalendarIcon, Clock, Tag, CheckCircle, X, Spinner } from "@phosphor-icons/react";
import type { BookingItem } from "@/features/checkout/hooks/useCheckout";

interface CheckoutMobileSummaryProps {
  item: BookingItem | null;
  title: string;
  coursePrice: number;
  dateParam?: string | null;
  timeParam?: string | null;
  formattedDateString: (dStr?: string | null) => string | null;
  formatCategoryName: (cat?: string | number | null) => string;
  mounted: boolean;
  appliedPromo?: {
    id: string;
    code: string;
    discountType: number;
    discountValue: number;
    discountAmount: number;
    waiveRegistrationFee: boolean;
    description?: string;
  } | null;
  promoCodeInput?: string;
  setPromoCodeInput?: (val: string) => void;
  applyingPromo?: boolean;
  applyPromoCode?: () => void;
  removePromoCode?: () => void;
  hasActivePromos?: boolean;
  discountAmount?: number;
}

export function CheckoutMobileSummary({
  item,
  title,
  coursePrice,
  dateParam,
  timeParam,
  formattedDateString,
  formatCategoryName,
  mounted,
  appliedPromo,
  promoCodeInput = "",
  setPromoCodeInput,
  applyingPromo = false,
  applyPromoCode,
  removePromoCode,
  hasActivePromos = false,
  discountAmount = 0,
}: CheckoutMobileSummaryProps) {
  return (
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
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs font-bold text-[#F8861D]">
              Prezzo corso: {coursePrice.toFixed(2)}€
            </p>
            {discountAmount > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                -{discountAmount.toFixed(2)}€
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Date & Time Summary on Mobile */}
      {dateParam && mounted && (
        <div
          className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]"
          suppressHydrationWarning
        >
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

      {/* Promo Code Input on Mobile - Only visible if active promos exist */}
      {(hasActivePromos || appliedPromo) && setPromoCodeInput && applyPromoCode && removePromoCode && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#043569]" weight="bold" />
              Codice Promozionale
            </span>
          </div>

          {appliedPromo ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" weight="fill" />
                <div className="min-w-0">
                  <span className="font-black text-emerald-900 tracking-wider block font-mono text-xs">
                    {appliedPromo.code}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium truncate block">
                    {appliedPromo.description || "Sconto applicato"} (-{discountAmount.toFixed(2)}€)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={removePromoCode}
                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-white/80 transition-colors shrink-0 ml-2"
                title="Rimuovi promo"
              >
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPromoCode();
                  }
                }}
                placeholder="es. PROMO10"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono uppercase border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white tracking-wider placeholder:normal-case placeholder:font-sans"
              />
              <button
                type="button"
                onClick={() => applyPromoCode()}
                disabled={applyingPromo || !promoCodeInput.trim()}
                className="px-3 py-1.5 bg-[#043569] hover:bg-[#032852] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center min-w-[64px]"
              >
                {applyingPromo ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : "Applica"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
