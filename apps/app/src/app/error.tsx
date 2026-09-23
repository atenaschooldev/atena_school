"use client";

import React, { useEffect } from "react";
import { captureExceptionToSentry } from "@atena/core";

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureExceptionToSentry(error, {
      instance: "student-portal",
      tags: { digest: error.digest || "none", boundary: "app-error" },
    }).catch(() => {});
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-[#043569]">Si è verificato un errore</h2>
          <p className="text-xs text-slate-500 font-medium">
            Si è verificato un problema imprevisto durante il caricamento del portale.
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
