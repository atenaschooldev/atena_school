"use client";

import Link from "next/link";
import { WarningCircle, ArrowLeft } from "@phosphor-icons/react";

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shrink-0">
          <WarningCircle className="w-9 h-9" weight="fill" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#043569]">
            Errore di autenticazione
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Si è verificato un problema durante l'accesso tramite il provider esterno. Riprova ad accedere o contattaci se il problema persiste.
          </p>
        </div>

        <Link
          href="/autenticazione/accedi"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#043569] text-white text-xs font-bold rounded-xl hover:bg-[#032852] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla pagina di accesso</span>
        </Link>
      </div>
    </main>
  );
}
