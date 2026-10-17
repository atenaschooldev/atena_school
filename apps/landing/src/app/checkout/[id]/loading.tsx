import React from "react";

export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Steps Progress Skeleton */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/30" />
            <div className="h-4 w-20 bg-slate-200 rounded hidden sm:block" />
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="h-4 w-24 bg-slate-200 rounded hidden sm:block" />
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="h-4 w-20 bg-slate-200 rounded hidden sm:block" />
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT Form Skeleton (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm animate-pulse space-y-5">
              <div className="h-7 w-48 bg-slate-200 rounded-xl" />
              <div className="h-4 w-64 bg-slate-100 rounded" />
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-100 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-12 w-full bg-slate-100 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-12 w-full bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT Summary Skeleton (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm animate-pulse space-y-5">
              <div className="h-6 w-36 bg-slate-200 rounded-lg" />
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <div className="h-6 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-24 bg-slate-300 rounded" />
                </div>
              </div>
              <div className="h-14 w-full bg-primary/30 rounded-2xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
