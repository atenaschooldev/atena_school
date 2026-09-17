import { Suspense } from "react";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { CheckoutSuccessView } from "@/features/checkout/views";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#043569] to-[#021f42]">
          <CircleNotch className="w-10 h-10 animate-spin text-[#F8861D]" />
        </div>
      }
    >
      <CheckoutSuccessView />
    </Suspense>
  );
}
