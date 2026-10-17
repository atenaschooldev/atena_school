"use client";

import React from "react";
import { ArrowsClockwise, Tag } from "@phosphor-icons/react";
import { BillingScheme, CourseBillingType } from "@atena/api-types";
import type { BookingItem } from "@/features/checkout/hooks/useCheckout";

interface CheckoutBillingSchemeSelectorProps {
  subscriptionsEnabled: boolean;
  item: BookingItem | null;
  billingScheme: BillingScheme;
  setBillingScheme: (scheme: BillingScheme) => void;
}

export function CheckoutBillingSchemeSelector({
  subscriptionsEnabled,
  item,
  billingScheme,
  setBillingScheme,
}: CheckoutBillingSchemeSelectorProps) {
  // If subscription feature is disabled globally, hide this component
  if (!subscriptionsEnabled || !item) {
    return null;
  }

  const courseBillingType = Number(item.billing_type || CourseBillingType.ONE_TIME_ONLY);

  // If course only supports one-time purchase, hide selector
  if (courseBillingType === CourseBillingType.ONE_TIME_ONLY) {
    return null;
  }

  const oneTimePrice = Number(item.price || 0);
  const subscriptionPrice = item.subscription_price != null
    ? Number(item.subscription_price)
    : (oneTimePrice > 0 ? oneTimePrice : 73.20);

  const canChooseOneTime = courseBillingType !== CourseBillingType.SUBSCRIPTION_ONLY;
  const canChooseSubscription = courseBillingType !== CourseBillingType.ONE_TIME_ONLY;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Opzione di Fatturazione
        </h3>
        <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
          Flessibile
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Option 1: One-Time Purchase */}
        {canChooseOneTime && (
          <div
            onClick={() => setBillingScheme(BillingScheme.FULL)}
            className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white flex items-start gap-2 ${
              billingScheme === BillingScheme.FULL
                ? "border-primary ring-2 ring-primary/10 shadow-sm"
                : "border-slate-200 hover:border-slate-300 opacity-75"
            }`}
          >
            <input
              type="radio"
              name="billingScheme"
              checked={billingScheme === BillingScheme.FULL}
              onChange={() => setBillingScheme(BillingScheme.FULL)}
              className="w-3.5 h-3.5 text-primary border-slate-300 focus:ring-primary mt-0.5 cursor-pointer"
            />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-primary flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-primary" weight="bold" />
                  Saldo Unico
                </span>
                <span className="text-xs font-black text-slate-800">
                  {oneTimePrice.toFixed(2)}€
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                Accesso all'intero ciclo del corso.
              </span>
            </div>
          </div>
        )}

        {/* Option 2: Monthly Recurring Subscription */}
        {canChooseSubscription && (
          <div
            onClick={() => setBillingScheme(BillingScheme.SUBSCRIPTION)}
            className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white flex items-start gap-2 relative overflow-hidden ${
              billingScheme === BillingScheme.SUBSCRIPTION
                ? "border-secondary ring-2 ring-secondary/10 shadow-sm bg-secondary-light/30"
                : "border-slate-200 hover:border-slate-300 opacity-75"
            }`}
          >
            <input
              type="radio"
              name="billingScheme"
              checked={billingScheme === BillingScheme.SUBSCRIPTION}
              onChange={() => setBillingScheme(BillingScheme.SUBSCRIPTION)}
              className="w-3.5 h-3.5 text-secondary border-slate-300 focus:ring-secondary mt-0.5 cursor-pointer"
            />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-secondary flex items-center gap-1">
                  <ArrowsClockwise className="w-3.5 h-3.5 text-secondary" weight="bold" />
                  Abbonamento Mensile
                </span>
                <span className="text-xs font-black text-secondary">
                  {subscriptionPrice.toFixed(2)}€<span className="text-[9px] font-normal text-slate-500">/mese</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                Rinnovo mensile automatico, disdici quando vuoi.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
