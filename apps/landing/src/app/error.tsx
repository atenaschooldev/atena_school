"use client";

import React, { useEffect } from "react";
import { reportClientError } from "../components/monitoring/SentryMonitoring";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest, context: "app-error-boundary" });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#043569]">Qualcosa è andato storto</h2>
          <p className="text-xs text-slate-500 font-medium">
            Si è verificato un errore temporaneo durante il caricamento del contenuto.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#043569] text-white text-xs font-bold hover:bg-[#032852] transition-colors shadow-md"
          >
            Riprova
          </button>
        </div>
      </div>
    </div>
  );
}
