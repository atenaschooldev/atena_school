"use client";

import { useState } from "react";
import {
  renderClientBookingConfirmationEmail,
  renderAdminBookingNotificationEmail,
  renderContactFormAdminEmail,
  BookingEmailTemplateData,
  ContactEmailTemplateData,
} from "@/lib/server/email-templates";

export default function EmailPreviewPage() {
  const [activeTab, setActiveTab] = useState<
    "client-paid" | "client-offline" | "client-child" | "admin-booking" | "admin-contact"
  >("client-paid");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const sampleDataPaid: BookingEmailTemplateData = {
    courseName: "Corso Inglese B2 First (Cambridge)",
    purchaserName: "Marco Rossi",
    studentName: "Marco Rossi",
    purchaserEmail: "marco.rossi@example.com",
    purchaserPhone: "+39 345 1234567",
    purchaserTaxCode: "RSSMRC85M01H501Z",
    isForChild: false,
    date: "15 Ottobre 2026",
    time: "17:30 - 19:00 (Martedì & Giovedì)",
    totalEur: "140.00",
    regFeeEur: "30.00",
    isPaidOnline: true,
    paymentStatusText: "Pagato Online con Carta (Stripe)",
    bookingId: "atn_bk_98f4a1c2",
    notes: "Vorrei prepararmi per la sessione d'esame di Dicembre.",
    appUrl: "https://app.atenaschool.com",
  };

  const sampleDataOffline: BookingEmailTemplateData = {
    courseName: "Corso di Spagnolo Livello A2",
    purchaserName: "Elena Bianchi",
    studentName: "Elena Bianchi",
    purchaserEmail: "elena.bianchi@example.com",
    purchaserPhone: "+39 338 7654321",
    purchaserTaxCode: "BNCLNE90A41H501X",
    isForChild: false,
    date: "20 Ottobre 2026",
    time: "18:00",
    totalEur: "120.00",
    regFeeEur: "30.00",
    isPaidOnline: false,
    paymentStatusText: "Prenotato con Saldo in Sede",
    bookingId: "atn_bk_33e1b7a9",
    notes: "Pagherò in contanti/POS in segreteria.",
    appUrl: "https://app.atenaschool.com",
  };

  const sampleDataChild: BookingEmailTemplateData = {
    courseName: "Inglese Young Learners (Movers)",
    purchaserName: "Giuseppe Ferrara (Genitore)",
    studentName: "Leonardo Ferrara (8 anni)",
    purchaserEmail: "giuseppe.ferrara@example.com",
    purchaserPhone: "+39 320 9988776",
    purchaserTaxCode: "FRRGPP78B12F112Y",
    isForChild: true,
    studentTaxCode: "FRRLND18C04F112K",
    studentBirthDate: "04/03/2018",
    date: "01 Ottobre 2026",
    time: "16:00 - 17:00",
    totalEur: "95.00",
    regFeeEur: "30.00",
    isPaidOnline: true,
    paymentStatusText: "Pagato Online con Carta",
    bookingId: "atn_bk_77d2c9e4",
    notes: "Ha già frequentato un anno di propedeutica.",
    appUrl: "https://app.atenaschool.com",
  };

  const sampleContact: ContactEmailTemplateData = {
    firstName: "Chiara",
    lastName: "Sorrenti",
    email: "chiara.sorrenti@example.com",
    phone: "+39 377 1122334",
    interest: "Certificazioni Cambridge C1 Advanced",
    message: "Buongiorno, vorrei sapere quando iniziano i prossimi corsi serali di preparazione C1 e se è possibile fare un test di livello preliminare. Grazie!",
    createdAt: "17 Settembre 2026, 14:30",
  };

  let rendered: { subject: string; html: string };

  switch (activeTab) {
    case "client-paid":
      rendered = renderClientBookingConfirmationEmail(sampleDataPaid);
      break;
    case "client-offline":
      rendered = renderClientBookingConfirmationEmail(sampleDataOffline);
      break;
    case "client-child":
      rendered = renderClientBookingConfirmationEmail(sampleDataChild);
      break;
    case "admin-booking":
      rendered = renderAdminBookingNotificationEmail(sampleDataChild);
      break;
    case "admin-contact":
      rendered = renderContactFormAdminEmail(sampleContact);
      break;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 relative">
      {/* Background Grid Pattern in Preview wrapper */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-xl">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#F8861D] animate-pulse"></span>
              <h1 className="text-xl font-black text-white tracking-tight">
                Atena School • Live Email Sandbox
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Anteprima con pattern a griglia (Grid layout), trust badge e branding ufficiale Atena
            </p>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "desktop"
                  ? "bg-[#043569] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🖥️ Desktop (600px)
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "mobile"
                  ? "bg-[#043569] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📱 Mobile (375px)
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("client-paid")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "client-paid"
                ? "bg-[#043569] text-white shadow-lg border border-blue-400/40"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            💳 1. Cliente: Pagato Online (Stripe)
          </button>

          <button
            onClick={() => setActiveTab("client-offline")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "client-offline"
                ? "bg-[#043569] text-white shadow-lg border border-blue-400/40"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            ⏳ 2. Cliente: Saldo in Sede
          </button>

          <button
            onClick={() => setActiveTab("client-child")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "client-child"
                ? "bg-[#043569] text-white shadow-lg border border-blue-400/40"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            👶 3. Cliente: Corso per Minore
          </button>

          <button
            onClick={() => setActiveTab("admin-booking")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "admin-booking"
                ? "bg-[#F8861D] text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            🔔 4. Admin: Notifica Iscrizione
          </button>

          <button
            onClick={() => setActiveTab("admin-contact")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === "admin-contact"
                ? "bg-[#F8861D] text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            ✉️ 5. Admin: Modulo Contatti
          </button>
        </div>

        {/* Email Subject preview */}
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 flex items-center gap-3 shadow-md">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#F8861D] shrink-0 bg-slate-900/80 px-2.5 py-1 rounded-md">
            Oggetto Email:
          </span>
          <span className="text-sm font-bold text-white truncate">{rendered.subject}</span>
        </div>

        {/* Live Email Preview Frame */}
        <div className="bg-slate-950/80 p-3 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex justify-center backdrop-blur-md">
          <div
            className={`transition-all duration-300 w-full ${
              viewMode === "desktop" ? "max-w-[650px]" : "max-w-[390px]"
            }`}
          >
            <iframe
              title="Atena Email Template Preview"
              srcDoc={rendered.html}
              className="w-full h-[850px] bg-slate-50 rounded-2xl shadow-2xl border-0 overflow-auto"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
