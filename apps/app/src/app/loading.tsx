import React from "react";

export default function PortalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100" />
        </div>

        {/* Schedule / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="h-5 w-28 bg-slate-200 rounded" />
            <div className="h-10 w-20 bg-slate-300 rounded-xl" />
            <div className="h-4 w-36 bg-slate-100 rounded" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-10 w-24 bg-slate-300 rounded-xl" />
            <div className="h-4 w-40 bg-slate-100 rounded" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-10 w-28 bg-slate-300 rounded-xl" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Main Section Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="h-6 w-44 bg-slate-200 rounded-lg" />
          <div className="space-y-3 pt-2">
            <div className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
            <div className="h-14 bg-slate-50 rounded-xl border border-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
