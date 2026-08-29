"use client";

import { Suspense, useState, useEffect, use } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  CheckCircle,
  ArrowRight,
  Envelope,
  CircleNotch,
  SquaresFour,
  Confetti,
  GoogleLogo,
  Sparkle,
  House,
  GraduationCap,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCheckoutSuccess } from "@/features/checkout/hooks/useCheckoutSuccess";

function SuccessContentWithId({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
  } = useCheckoutSuccess(id);

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

  const dateLocale = it;
  const courseName = bookingData?.item_name || bookingData?.course_name || bookingData?.name || bookingData?.title_it || bookingData?.title || "Corso Atena School";
  const regFee = Number(bookingData?.registration_fee || 0);
  const totalAmount = Number(bookingData?.amount_paid || 0);
  const coursePrice = Number(
    bookingData?.course_price ??
    (totalAmount > 0 ? (totalAmount >= regFee ? totalAmount - regFee : totalAmount) : (bookingData?.item_price ?? 0))
  );
  const finalTotal = totalAmount > 0 ? totalAmount : (coursePrice + regFee);

  const rawDate = bookingData?.starts_at || bookingData?.start_date || bookingData?.booking_date || bookingData?.date;
  const formattedDate = rawDate
    ? (typeof rawDate === "string" && !rawDate.includes("T") && !isNaN(Date.parse(rawDate))
      ? format(new Date(rawDate), "d MMMM yyyy", { locale: dateLocale })
      : typeof rawDate === "string" && rawDate.includes("T")
        ? format(new Date(rawDate), "d MMMM yyyy", { locale: dateLocale })
        : rawDate)
    : "Da concordare";

  const rawTime = bookingData?.start_time || bookingData?.orario || bookingData?.time;
  const formattedTime = rawTime || "16:00";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16 pt-20 sm:pt-24">
      <div className="border-b border-slate-200/80 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <CheckoutStepper currentStep={3} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 w-full flex-1">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-xs animate-bounce-short">
            <CheckCircle className="w-10 h-10" weight="fill" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#043569] tracking-tight mb-2">
            {isPaid ? "Prenotazione Confermata!" : "Richiesta Inviata con Successo!"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
            {isPaid
              ? "Abbiamo ricevuto la tua iscrizione. Ti abbiamo inviato una conferma via email con tutti i dettagli."
              : "La tua prenotazione è stata registrata. Ti abbiamo inviato un'email di conferma."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="font-bold text-slate-800 text-base sm:text-lg">Riepilogo lezione</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
              {isPaid ? "Pagato" : "In sospeso"}
            </span>
          </div>

          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between items-center text-slate-600">
              <span>Servizio</span>
              <span className="font-semibold text-slate-800 text-right">{courseName}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Data della prima lezione</span>
              <span className="font-semibold text-slate-800 text-right">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Orario standard</span>
              <span className="font-semibold text-slate-800 text-right">{formattedTime}</span>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-600">
              <span>Prezzo corso</span>
              <span className="font-semibold text-slate-800">€{coursePrice.toFixed(2)}</span>
            </div>

            {regFee > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Quota iscrizione annuale</span>
                <span className="font-semibold text-[#F8861D]">€{regFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-base sm:text-lg font-bold text-slate-900">
            <span>Totale</span>
            <span className="text-[#043569] text-xl font-extrabold">€{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {emailDisplay && (
          <div className="bg-slate-100/80 rounded-2xl p-4 text-center text-slate-600 text-xs sm:text-sm mb-8 flex items-center justify-center gap-2 border border-slate-200/60">
            <Envelope className="w-4 h-4 text-[#F8861D] shrink-0" />
            <span>
              Conferma inviata a <strong className="text-slate-800">{emailDisplay}</strong>
            </span>
          </div>
        )}

        <div className="space-y-3">
          {user ? (
            <button
              onClick={() => (window.location.href = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002")}
              className="w-full bg-[#043569] hover:bg-[#032850] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
            >
              <SquaresFour className="w-5 h-5 text-[#F8861D]" />
              <span>Vai al tuo Portale Studente</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <div className="bg-gradient-to-br from-[#043569] to-[#032850] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkle className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#F8861D] mb-4 border border-white/10">
                  <Sparkle className="w-3.5 h-3.5" />
                  <span>Area Riservata</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Accedi al tuo Portale Studente</h3>
                <p className="text-white/80 text-xs sm:text-sm mb-6 max-w-md leading-relaxed">
                  Nel tuo portale potrai consultare il calendario completo delle lezioni, accedere ai materiali didattici e gestire il tuo profilo.
                </p>

                {isGmail ? (
                  <button
                    onClick={() => {
                      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
                      window.location.href = `${appUrl}/autenticazione/accedi?email=${encodeURIComponent(emailDisplay)}`;
                    }}
                    className="w-full bg-white hover:bg-slate-100 text-[#043569] font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-3 cursor-pointer text-sm sm:text-base"
                  >
                    <GoogleLogo className="w-5 h-5 text-red-500 shrink-0" weight="bold" />
                    <span>Accedi con Google</span>
                  </button>
                ) : (
                  <div>
                    {magicLinkSent ? (
                      <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 text-center">
                        <p className="text-emerald-200 text-xs sm:text-sm font-semibold mb-1">
                          Magic Link inviato con successo!
                        </p>
                        <p className="text-white/70 text-xs">
                          Controlla la tua casella email (<strong className="text-white">{emailDisplay}</strong>) e clicca sul link per accedere direttamente senza password.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleSendMagicLink}
                        disabled={sendingMagicLink}
                        className="w-full bg-[#F8861D] hover:bg-[#e07516] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                      >
                        {sendingMagicLink ? (
                          <CircleNotch className="w-5 h-5 animate-spin" />
                        ) : (
                          <Envelope className="w-5 h-5" />
                        )}
                        <span>{sendingMagicLink ? "Invio link in corso..." : "Invia Magic Link di Accesso"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Return to Home / Explore Courses Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/corsi"
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#043569] font-bold text-xs sm:text-sm border border-slate-200 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-[#F8861D]" weight="bold" />
            <span>Esplora altri Corsi</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <House className="w-4 h-4 text-slate-500" weight="bold" />
            <span>Torna alla Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPageWithId({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <main className="h-screen flex items-center justify-center bg-[#043569]">
          <CircleNotch className="w-10 h-10 animate-spin text-[#F8861D]" />
        </main>
      }
    >
      <SuccessContentWithId id={id} />
    </Suspense>
  );
}
