"use client";

import { Suspense } from "react";
import {
  CheckCircle,
  ArrowRight,
  Envelope,
  CircleNotch,
  CalendarBlank,
  Clock,
  SquaresFour,
  Confetti,
  GoogleLogo,
} from "@phosphor-icons/react";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCheckoutSuccess } from "@/features/checkout/hooks/useCheckoutSuccess";

function SuccessContent() {
  const {
    router,
    verifying,
    user,
    bookingData,
    sendingMagicLink,
    emailDisplay,
    isGmail,
    isPaid,
    magicLinkSent,
    handleSendMagicLink,
  } = useCheckoutSuccess();

  if (verifying) {
    return (
      <main className="h-screen flex items-center justify-center bg-gradient-to-br from-[#043569] via-[#054080] to-[#021f42] px-4">
        <div className="flex flex-col items-center gap-4 text-white">
          <CircleNotch className="w-10 h-10 animate-spin text-[#F8861D]" />
          <p className="font-bold text-sm uppercase tracking-widest text-white/60">
            Conferma in corso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-[#043569] via-[#054080] to-[#021f42] px-4 sm:px-6 flex flex-col relative py-8 pb-20 lg:py-0">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#F8861D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto flex flex-col h-auto lg:h-full py-6 md:py-8 relative z-10 pb-16 lg:pb-0">
        {/* Stepper */}
        <CheckoutStepper currentStep={3} dark />

        {/* Main content — two columns */}
        <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 mt-6">

          {/* LEFT — celebration */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            {/* Icon */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
                isPaid
                  ? "bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/30"
                  : "bg-gradient-to-br from-[#F8861D] to-[#e07010] shadow-[#F8861D]/30"
              }`}>
                <CheckCircle className="w-10 h-10 text-white" weight="bold" />
              </div>
              {/* Sparkle dot */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Confetti className="w-3 h-3 text-yellow-900" weight="fill" />
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#F8861D] mb-1">
                {isPaid ? "Pagamento confermato" : "Prenotazione confermata"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {isPaid ? "Tutto\npagato!" : "Tutto\npronto!"}
              </h1>
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {!user ? (
                isGmail ? (
                  isPaid
                    ? "Il pagamento è stato elaborato. I dettagli dell'acquisto ti sono stati inviati via email e la lezione è già disponibile nella tua Area Personale (accedi con Google)."
                    : "La prenotazione è confermata. I dettagli ti sono stati inviati via email e la lezione è già registrata nella tua Area Personale (accedi con Google)."
                ) : (
                  isPaid
                    ? "Il pagamento è stato elaborato. I dettagli dell'acquisto ti sono stati inviati via email e la lezione è disponibile nella tua Area Personale tramite il Magic Link inviato."
                    : "La prenotazione è confermata. I dettagli ti sono stati inviati via email e la lezione è registrata nella tua Area Personale tramite il Magic Link inviato."
                )
              ) : (
                isPaid
                  ? "Il tuo pagamento è stato elaborato con successo. Trovi la lezione nel tuo pannello personale."
                  : "La prenotazione è confermata. Ricordati di portare il pagamento il giorno della lezione."
              )}
            </p>

            {/* Email sent row */}
            {emailDisplay && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                <Envelope className="w-4 h-4 text-[#F8861D] shrink-0" />
                <p className="text-xs text-white/70">
                  Conferma inviata a <span className="text-white font-bold">{emailDisplay}</span>
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — details card */}
          <div className="lg:w-1/2 w-full max-w-sm lg:max-w-none">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 space-y-5">

              {/* Course info card */}
              {(bookingData?.item_name || bookingData?.item_price) && (
                <div className="flex items-center gap-4 p-4 bg-white/8 rounded-2xl border border-white/12">
                  {bookingData.item_photo ? (
                    <img
                      src={bookingData.item_photo}
                      alt={bookingData.item_name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#F8861D]/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-7 h-7 text-[#F8861D]" weight="duotone" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Corso acquistato</p>
                    <p className="font-bold text-sm text-white leading-tight truncate">{bookingData.item_name}</p>
                    {bookingData.item_teacher && (
                      <p className="text-xs text-white/50 mt-0.5">{bookingData.item_teacher}</p>
                    )}
                  </div>
                  {bookingData.item_price && (
                    <span className="text-xl font-black text-white shrink-0">
                      €{bookingData.item_price}
                    </span>
                  )}
                </div>
              )}

              {/* Booking details */}
              {bookingData?.booking_date && (
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Dettagli lezione</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/8">
                      <div className="w-8 h-8 rounded-xl bg-[#F8861D]/15 flex items-center justify-center shrink-0">
                        <CalendarBlank className="w-4 h-4 text-[#F8861D]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Data</p>
                        <p className="text-sm font-bold text-white">{bookingData.booking_date}</p>
                      </div>
                    </div>
                    {bookingData.booking_time && (
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/8">
                        <div className="w-8 h-8 rounded-xl bg-[#F8861D]/15 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-[#F8861D]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Orario</p>
                          <p className="text-sm font-bold text-white">Ore {bookingData.booking_time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* CTA */}
              {user ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 bg-white text-[#043569] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F8861D] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl"
                >
                  <SquaresFour className="w-4 h-4" />
                  Vai al tuo pannello
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : isGmail ? (
                <div className="space-y-3">
                  <p className="text-xs text-white/60 text-center">
                    Accedi con Google per accedere alla tua Area Personale
                  </p>
                  <button
                    onClick={() => router.push(`/auth/login?redirect=/dashboard`)}
                    className="w-full py-4 bg-white text-[#043569] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F8861D] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-xl"
                  >
                    <GoogleLogo className="w-4 h-4" weight="bold" />
                    Accedi con Google
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-white/60 text-center">
                    {magicLinkSent
                      ? "Ti abbiamo inviato un link magico d'accesso via email. Clicca sul link per entrare."
                      : "Accedi alla dashboard con il link inviato per email"}
                  </p>
                  <button
                    onClick={handleSendMagicLink}
                    disabled={sendingMagicLink}
                    className="w-full py-4 bg-white text-[#043569] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#F8861D] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl disabled:opacity-60"
                  >
                    {sendingMagicLink ? (
                      <CircleNotch className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Envelope className="w-4 h-4" />
                        {magicLinkSent ? "Invia di nuovo il link" : "Invia link di accesso"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#043569] to-[#021f42]">
        <CircleNotch className="w-10 h-10 animate-spin text-[#F8861D]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
