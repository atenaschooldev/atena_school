import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#FAA904] border-r-[#F8861D] animate-spin" />
        <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-[#043569] to-[#0a5ba8] opacity-80 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
        Caricamento in corso...
      </p>
    </div>
  );
}
