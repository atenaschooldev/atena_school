"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";
import { WarningCircle, ArrowClockwise, House } from "@phosphor-icons/react";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[COURSES ROUTE ERROR]:", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <WarningCircle className="w-8 h-8" weight="duotone" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Qualcosa è andato storto
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Non siamo riusciti a caricare i corsi al momento. Si è verificato un errore imprevisto o un problema di connessione.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-secondary transition-all duration-200 active:scale-95 shadow-sm shadow-slate-200"
          >
            <ArrowClockwise className="w-4 h-4" weight="bold" />
            Riprova
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all duration-200 active:scale-95"
          >
            <House className="w-4 h-4" weight="bold" />
            Torna alla Home
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-slate-400 font-mono">
            Codice errore: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
