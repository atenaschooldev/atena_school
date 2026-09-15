"use client";

import React from "react";
import { Lock, WhatsappLogo } from "@phosphor-icons/react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Link } from "@/i18n/routing";
import type { CheckoutFormValues } from "@/features/checkout/hooks/useCheckout";

interface CheckoutNotesAndGdprProps {
  register: UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
  title: string;
}

export function CheckoutNotesAndGdpr({
  register,
  errors,
  title,
}: CheckoutNotesAndGdprProps) {
  return (
    <>
      {/* Additional Notes */}
      <div className="pt-1">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Note o richieste per la segreteria (opzionale)
        </label>
        <textarea
          rows={2}
          maxLength={500}
          {...register("notes")}
          placeholder="Es. preferenze orarie, segnalazioni didattiche..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043569]/10 focus:border-[#043569] bg-white resize-none font-medium transition-all"
        />
        {errors.notes && (
          <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.notes.message}</p>
        )}
      </div>

      {/* GDPR & Privacy Compliance Notice */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          I tuoi dati sono protetti e trattati nel rispetto del Regolamento UE 2016/679 (GDPR). Inviando la richiesta confermi di aver preso visione della nostra{" "}
          <Link href="/privacy" target="_blank" className="text-[#043569] font-bold underline hover:text-[#F8861D]">
            Informativa sulla Privacy
          </Link>
          .
        </span>
      </div>

      {/* WhatsApp Assistance Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <WhatsappLogo className="w-4 h-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-950 truncate">Hai dubbi o preferenze orarie?</p>
            <p className="text-[10px] text-emerald-800/80 font-medium">Scrivi alla segreteria via WhatsApp</p>
          </div>
        </div>
        <a
          href={`https://wa.me/393756052362?text=${encodeURIComponent(
            `Ciao Atena School, vorrei maggiori informazioni per l'iscrizione al corso: ${title}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[11px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          Chatta
        </a>
      </div>
    </>
  );
}
