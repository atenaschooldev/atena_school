"use client";

import React from "react";
import Image from "next/image";
import { Calendar as CalendarIcon, Clock } from "@phosphor-icons/react";
import type { BookingItem } from "@/features/checkout/hooks/useCheckout";

interface CheckoutMobileSummaryProps {
  item: BookingItem | null;
  title: string;
  coursePrice: number;
  dateParam?: string | null;
  timeParam?: string | null;
  formattedDateString: (dStr?: string | null) => string | null;
  formatCategoryName: (cat?: string) => string;
  mounted: boolean;
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
          <p className="text-xs font-bold text-[#F8861D] mt-0.5">
            Prezzo corso: {coursePrice.toFixed(2)}€
          </p>
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
    </div>
  );
}
