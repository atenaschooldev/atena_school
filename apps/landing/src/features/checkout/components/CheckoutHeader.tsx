"use client";

import React from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";

interface CheckoutHeaderProps {
  courseSlugOrId: string;
}

export function CheckoutHeader({ courseSlugOrId }: CheckoutHeaderProps) {
  return (
    <>
      {/* Back Link to Course Page */}
      <div className="mb-2">
        <Link
          href={`/corsi/${courseSlugOrId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors group"
        >
          <CaretLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Torna alla scheda del corso
        </Link>
      </div>

      {/* Header Title */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-0.5">
          Iscrizione e Checkout
        </span>
        <h1 className="text-xl sm:text-3xl font-black text-primary tracking-tight">
          Completa l'iscrizione
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
          Inserisci i dati dello studente e seleziona la modalità di pagamento desiderata.
        </p>
      </div>
    </>
  );
}
