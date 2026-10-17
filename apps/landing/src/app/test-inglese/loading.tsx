import React from "react";

export default function TestIngleseLoading() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl px-4 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center space-y-3">
          <div className="h-8 w-64 bg-slate-300 rounded-xl mx-auto" />
          <div className="h-4 w-80 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Card Question Skeleton */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="h-4 w-28 bg-secondary/30 rounded-full" />
          <div className="h-6 w-full bg-slate-200 rounded-lg" />
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
