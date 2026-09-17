import React, { Suspense } from "react";
import { CheckoutView } from "@/features/checkout/views";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#043569]" />
        </div>
      }
    >
      <CheckoutView id={id} />
    </Suspense>
  );
}
