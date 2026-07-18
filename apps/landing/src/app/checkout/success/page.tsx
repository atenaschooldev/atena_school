"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, BookmarkSimple, Envelope, CircleNotch } from "@phosphor-icons/react";
import confetti from "canvas-confetti";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("booking_id");

  const [verifying, setVerifying] = useState(!!sessionId); // only verify for Stripe flow

  useEffect(() => {
    // If coming from Stripe, immediately verify & update status
    async function verifyStripePayment() {
      if (!sessionId || !bookingId) {
        setVerifying(false);
        return;
      }

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ session_id: sessionId, booking_id: bookingId }),
          }
        );
      } catch {
        // Non-critical — webhook will handle it as fallback
      } finally {
        setVerifying(false);
      }
    }

    verifyStripePayment();
  }, [sessionId, bookingId]);

  useEffect(() => {
    if (verifying) return; // wait until verification done before confetti

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F8861D", "#043569", "#FFFFFF"],
    });
  }, [verifying]);

  if (verifying) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
        <div className="flex flex-col items-center gap-4 text-primary">
          <CircleNotch className="w-10 h-10 animate-spin" />
          <p className="font-bold text-sm uppercase tracking-widest opacity-60">
            Conferma pagamento in corso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-white rounded-3xl border border-border shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Tutto pronto!
          </h1>

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/15">
              <BookmarkSimple className="w-5 h-5 text-secondary shrink-0 mt-0.5" weight="fill" />
              <p className="text-sm text-foreground/80">
                La tua prenotazione è salvata nel tuo{" "}
                <span className="font-bold text-foreground">pannello personale</span>.
                Puoi visualizzarla e gestirla in qualsiasi momento.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/15">
              <Envelope className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">
                Abbiamo inviato una{" "}
                <span className="font-bold text-foreground">email di conferma</span>{" "}
                all&apos;indirizzo che hai fornito con tutti i dettagli della prenotazione.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 space-y-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
          >
            Vai al pannello
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
