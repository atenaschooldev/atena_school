import React from "react";

export default function CourseDetailLoading() {
  return (
    <main className="bg-slate-100 min-h-screen pt-16 sm:pt-20 pb-28 lg:pb-6 font-sans flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-4 sm:gap-5">
          {/* LEFT — Course Detail Skeleton */}
          <div className="flex flex-col gap-4">
            {/* Hero Image Skeleton */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-[#043569]/30 animate-pulse aspect-[16/8] sm:aspect-[16/6] lg:aspect-[16/5.5] xl:aspect-[16/6] w-full max-h-[220px] sm:max-h-[250px] p-6 flex flex-col justify-end">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-24 bg-white/30 rounded-full" />
                <div className="h-5 w-28 bg-[#F8861D]/50 rounded-full" />
              </div>
              <div className="h-8 w-3/4 bg-white/40 rounded-xl" />
            </div>

            {/* Quick Specs Row */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 animate-pulse">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 animate-pulse flex flex-col gap-4">
              <div className="flex gap-3 border-b border-slate-100 pb-3">
                <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                <div className="h-8 w-24 bg-slate-100 rounded-lg" />
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-5/6 bg-slate-100 rounded" />
                <div className="h-4 w-4/5 bg-slate-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* RIGHT — Booking Card Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm animate-pulse flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="h-5 w-32 bg-slate-200 rounded-lg" />
                <div className="h-6 w-20 bg-slate-200 rounded-lg" />
              </div>

              {/* Date selection placeholder */}
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                </div>
              </div>

              {/* Price card placeholder */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-7 w-32 bg-slate-300 rounded-lg" />
              </div>

              {/* CTA button placeholder */}
              <div className="h-12 w-full bg-[#F8861D]/40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
