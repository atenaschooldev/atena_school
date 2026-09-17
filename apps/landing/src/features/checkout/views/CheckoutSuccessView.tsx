"use client";

import { useState, useEffect } from "react";
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
import { CheckoutStepper } from "@/features/checkout/components";
import { useCheckoutSuccess } from "@/features/checkout/hooks/useCheckoutSuccess";
import { useMounted } from "@/hooks/useMounted";

export function CheckoutSuccessView() {
  const mounted = useMounted();

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

  const dateLocale = it;
  const courseName = bookingData?.item_name || bookingData?.course_name || bookingData?.name || bookingData?.title_it || bookingData?.title || "Corso Atena School";
  const regFee = Number(bookingData?.registration_fee || 0);
  const coursePrice = Number(bookingData?.course_price ?? bookingData?.item_price ?? 0);
  const totalPaid = Number(bookingData?.amount_paid || (coursePrice + regFee));

  const rawDate = bookingData?.starts_at || bookingData?.start_date || bookingData?.booking_date || bookingData?.date;
  const formattedDate = rawDate
    ? (typeof rawDate === "string" && !rawDate.includes("T") && !isNaN(Date.parse(rawDate))
      ? format(new Date(rawDate), "d MMMM yyyy", { locale: dateLocale })
      : typeof rawDate === "string" && rawDate.includes("T")
        ? format(new Date(rawDate), "d MMMM yyyy", { locale: dateLocale })
        : rawDate)
    : null;

  const rawTime = bookingData?.starts_at || bookingData?.start_time || bookingData?.time;
  const formattedTime = rawTime
    ? (typeof rawTime === "string" && rawTime.includes("T") ? format(new Date(rawTime), "HH:mm") : rawTime)
    : null;

  return (
    <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-[#043569]/[0.02] to-[#F8861D]/[0.03] text-foreground flex flex-col items-center justify-center relative">
      {/* Subtle Ambient Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#043569]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F8861D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Premium SaaS Success Card */}
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-7 sm:p-9 flex flex-col items-center text-center space-y-6 relative z-10 overflow-hidden select-none">

        {/* Top Celebration Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50 shrink-0">
          <CheckCircle className="w-9 h-9" weight="fill" />
        </div>

        {/* Title & Status */}
        <div className="space-y-1.5">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full">
            {isPaid ? "Pagamento confermato" : "Prenotazione confermata"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#043569] pt-1">
            {isPaid ? "Grazie per il tuo acquisto!" : "Prenotazione ricevuta!"}
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed pt-0.5">
            {!user ? (
              isGmail ? (
                isPaid
                  ? "Il pagamento è stato completato. I dettagli ti sono stati inviati via email e la lezione è già disponibile nel tuo pannello personale."
                  : "La lezione è stata prenotata. Ti abbiamo inviato una conferma via email con tutte le informazioni."
              ) : (
                isPaid
                  ? "Il pagamento è stato completato. Trovi i dettagli nell'email inviata e nel tuo pannello tramite il link d'accesso."
                  : "La lezione è stata prenotata. Ti abbiamo inviato un'email di conferma con il link per accedere."
              )
            ) : (
              isPaid
                ? "Il tuo pagamento è stato elaborato con successo. Puoi accedere al tuo pannello in qualsiasi momento."
                : "La prenotazione è confermata. Ti aspettiamo in sede per la tua lezione!"
            )}
          </p>
        </div>

        {/* Order Receipt Box */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 text-xs font-bold text-[#043569]">
            <span>Riepilogo lezione</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
              {isPaid ? "Pagato" : "Paga in sede"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Servizio</span>
              <span className="font-bold text-slate-800 text-right max-w-[220px] truncate">
                {courseName}
              </span>
            </div>

            {formattedDate && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Data della prima lezione</span>
                <span className="font-bold text-slate-800">{formattedDate}</span>
              </div>
            )}

            {formattedTime && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Orario standart</span>
                <span className="font-bold text-slate-800">{formattedTime}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Prezzo corso</span>
              <span className="font-bold text-slate-800">€{coursePrice.toFixed(2)}</span>
            </div>

            {regFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Quota iscrizione annuale</span>
                <span className="font-bold text-amber-600">€{regFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
              <span className="font-bold text-slate-700">Totale</span>
              <span className="font-extrabold text-[#043569] text-base">€{totalPaid.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Email Sent Confirmation Badge */}
        {emailDisplay && (
          <div className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3">
            <Envelope className="w-3.5 h-3.5 text-[#F8861D]" />
            <span>Conferma inviata a <strong className="text-slate-800">{emailDisplay}</strong></span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-1">
          {user ? (
            <button
              onClick={() => {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
                window.location.href = `${appUrl}/dashboard`;
              }}
              className="w-full py-3.5 px-6 bg-[#043569] hover:bg-[#032850] active:scale-[0.99] text-white rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <SquaresFour className="w-4 h-4" />
              <span>Vai alla tua Dashboard</span>
            </button>
          ) : isGmail ? (
            <button
              onClick={() => {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
                window.location.href = `${appUrl}/autenticazione/accedi?redirect=/dashboard`;
              }}
              className="w-full py-3.5 px-6 bg-[#F8861D] hover:bg-[#e07516] active:scale-[0.99] text-white rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <GoogleLogo className="w-4 h-4" weight="bold" />
              <span>Accedi con Google</span>
            </button>
          ) : (
            <button
              onClick={handleSendMagicLink}
              disabled={sendingMagicLink}
              className="w-full py-3.5 px-6 bg-[#F8861D] hover:bg-[#e07516] active:scale-[0.99] text-white rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {sendingMagicLink ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Envelope className="w-4 h-4" />
                  <span>{magicLinkSent ? "Invia di nuovo il link" : "Invia link di accesso"}</span>
                </>
              )}
            </button>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
            <Link
              href="/corsi"
              className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-[#043569] font-bold text-xs border border-slate-200 shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-[#F8861D]" weight="bold" />
              <span>Esplora altri Corsi</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <House className="w-4 h-4 text-slate-500" weight="bold" />
              <span>Torna alla Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutSuccessView;
