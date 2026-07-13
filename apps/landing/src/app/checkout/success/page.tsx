"use client";

import { useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  const t = useTranslations("booking");
  const router = useRouter();

  useEffect(() => {
    // Trigger celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#000000", "#FFFFFF"]
    });

    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-white rounded-3xl border border-border shadow-2xl">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Grazie!
          </h1>
          <p className="text-muted-foreground">
            Il tuo pagamento è stato elaborato con successo. Riceverai presto una email di conferma.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
          >
            Vai al Pannello
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <p className="text-xs text-muted-foreground animate-pulse">
            Verrai reindirizzato automaticamente tra pochi secondi...
          </p>
        </div>
      </div>
    </main>
  );
}
