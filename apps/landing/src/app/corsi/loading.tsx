import React from "react";

export default function CoursesLoading() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-28 relative overflow-hidden">
      {/* Background decorative ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      {/* Hero Header Skeleton */}
      <header className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 pb-8 text-center relative z-10 animate-pulse">
        <div className="h-12 md:h-16 w-64 md:w-96 bg-slate-200 rounded-2xl mx-auto mb-6" />
        <div className="h-5 w-80 md:w-full max-w-xl bg-slate-100 rounded-lg mx-auto mb-3" />
        <div className="h-5 w-60 md:w-full max-w-md bg-slate-100 rounded-lg mx-auto" />
        <div className="h-1.5 w-32 bg-primary/30 mx-auto mt-8 rounded-full" />
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Category Pills Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 animate-pulse">
          <div className="h-10 w-28 bg-slate-200 rounded-full" />
          <div className="h-10 w-36 bg-slate-100 rounded-full" />
          <div className="h-10 w-44 bg-slate-100 rounded-full" />
          <div className="h-10 w-40 bg-slate-100 rounded-full" />
        </div>

        {/* Course Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full animate-pulse"
            >
              {/* Image skeleton */}
              <div className="relative h-64 w-full bg-slate-200">
                <div className="absolute top-4 left-4 h-6 w-24 bg-white/70 rounded-xl" />
                <div className="absolute top-4 right-4 h-6 w-28 bg-white/70 rounded-xl" />
              </div>

              {/* Card content skeleton */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Title */}
                <div className="h-7 w-3/4 bg-slate-200 rounded-xl mb-4" />

                {/* Metadata badges */}
                <div className="flex gap-3 mb-4">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                </div>

                {/* Description lines */}
                <div className="space-y-2 mb-6 flex-grow">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
                  <div className="h-3.5 w-2/3 bg-slate-100 rounded" />
                </div>

                {/* Footer price & CTA */}
                <div className="pt-5 border-t border-slate-100 mt-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                    <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                  </div>
                  <div className="h-11 w-full bg-slate-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
